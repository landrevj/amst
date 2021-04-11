/* eslint-disable import/prefer-default-export */
import { basename, extname } from 'path';
import { FilterQuery, FindOptions } from '@mikro-orm/core';
import { lookup } from 'mime-types';
import log from 'electron-log';

import { DB } from '../../db';
import { Workspace, File, Folder } from '../../db/entities';
import { arrayDifference, glob } from '../../utils';
import { SocketRequest, SocketRequestStatus, SocketResponse } from '../../utils/websocket';
import { EntityChannel } from './Entity';


export class WorkspaceChannel extends EntityChannel<Workspace>
{
  constructor()
  {
    super(Workspace);
    this.setName('Workspace');
  }

  // /////////////////////////////////////////////////////////
  // //////////////////////// ACTIONS ////////////////////////
  // /////////////////////////////////////////////////////////
  async createAction(request: SocketRequest<[string, string[]]>)
  {
    this.handleAction(request, ([name, paths]) => {
      return this.create([name], newWorkspace => {

        paths.forEach(path => {
          const folder = new Folder(path);
          newWorkspace.folders.add(folder);
        });

      });
    });
  }

  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////
  async readAction(request: SocketRequest<[FilterQuery<Workspace>, FindOptions<Workspace>]>)
  {
    this.handleAction(request, ([where, options]) => {
      return this.read(where, options);
    });
  }

  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////


  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////
  async destroyAction(request: SocketRequest<number[]>)
  {
    this.handleAction(request, (ids) => {
      return this.destroy(ids);
    });
  }

  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////
  async emitSyncUpdate(workspaceID: number, text: string, success?: boolean)
  {
    let status = SocketRequestStatus.RUNNING;
    if      (success === true)  status = SocketRequestStatus.SUCCESS;
    else if (success === false) status = SocketRequestStatus.FAILURE;

    this.getSocket()?.emit(`Workspace_${workspaceID}_sync`, {
      status,
      data: text,
    } as SocketResponse<string>);
  }

  async syncFiles(request: SocketRequest<number>)
  {
    /* a: get list of files on the workspace
     * b: get list of new paths to be added
     * c: query the db for existing files with paths in 'b'
     *
     * d: files in 'c' that arent in 'a'. (files which are already in the database but not on the current workspace, which need to get added to it)
     * e: paths from 'b' that aren't on files in 'a' or 'd'. (new paths which arent in the db, on or off of the current workspace)
     *
     * f => add d to the workspace
     * g => add e to the workspace as files
     */

    if (!request.params) return;
    const id = request.params;

    const em = DB.getNewEM();

    const workspace = await em?.findOne(Workspace, id, ['files', 'folders']).catch(error => {
      log.error(error);
      this.emitFailure(request);
    });

    if (!workspace)
    {
      this.emitFailure(request);
      return;
    }

    this.getSocket()?.emit(request.responseChannel as string, { status: SocketRequestStatus.SUCCESS } as SocketResponse<void>);
    this.emitSyncUpdate(workspace.id, 'Started sync...');

    // a
    const existingFilesOnWorkspace = workspace.files.getItems();

    // b
    const searchPaths = workspace.folders.getItems().map(folder => folder.path);
    const matches     = (await Promise.all(glob(searchPaths))).flat();
    const matchPaths  = matches.map(entry => entry.path);

    // c
    const existingFilesFromMatches = await em?.find(File, { fullPath: matchPaths }).catch(error => {
      log.error(error);
      this.emitFailure(request);
    });

    // d
    const existingFilesNotOnWorkspace: File[] = existingFilesFromMatches ? arrayDifference(existingFilesFromMatches, existingFilesOnWorkspace, file1 => file1.fullPath, file2 => file2.fullPath) : [];
    this.emitSyncUpdate(workspace.id, `Found ${existingFilesNotOnWorkspace.length} pre-existing files...`);

    // e
    const entriesNotOnWorkspace = arrayDifference(matches, existingFilesOnWorkspace, entry => entry.path, file => file.fullPath);
    const entriesNotInDB = arrayDifference(entriesNotOnWorkspace, existingFilesNotOnWorkspace, entry => entry.path, file => file.fullPath);
    this.emitSyncUpdate(workspace.id, `Found ${entriesNotInDB.length} new files...`);

    // DB TRANSACTION START //////////////////////////////////////////////
    const updatedWorkspace = await em?.transactional<Workspace>(t_em => {

      // f
      existingFilesNotOnWorkspace.forEach(file => {
        workspace.files.add(file);
      });

      // g
      const { length } = entriesNotInDB;

      entriesNotInDB.forEach((entry, i) => {
        this.emitSyncUpdate(workspace.id, `Importing new file ${i + 1} of ${length} to the DB...`);

        const ext = extname(entry.name); // extname returns extensions with the dot if there was an extension
        const file = new File(basename(entry.name, ext), ext.slice(1), entry.path); // so we slice it before persisting it. ("".slice(1) is "")
        // calculate some metadata
        const mt = lookup(entry.path);
        if (mt) file.mimeType = mt;
        // file.md5      = md5File.sync(entry.path);
        workspace.files.add(file);
      });
      // DONE! Persist to DB...
      t_em.persist(workspace);

      return new Promise(resolve => {
        resolve(workspace);
      });

    }).catch(error => {
      log.error(error);
    });
    // DB TRANSACTION END ////////////////////////////////////////////////

    if (updatedWorkspace)
    {
      const newFileCount = existingFilesNotOnWorkspace.length + entriesNotInDB.length;
      this.emitSyncUpdate(workspace.id, `Added ${newFileCount} files to the workspace!`, true);
      return;
    }

    this.emitSyncUpdate(workspace.id, 'DB transaction failed!', false);
  }

  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handle(request: SocketRequest<any>)
  {
    if (!this.getSocket()) return; // check that the DB is initialized and we have a socket

    if (!request.responseChannel) request.responseChannel = `${this.getName()}_response`;

    switch (request.action)
    {
      case 'create':
        this.createAction(request);
        break;
      case 'read':
        this.readAction(request);
        break;
      case 'destroy':
        this.destroyAction(request);
        break;
      case 'syncFiles':
        this.syncFiles(request);
        break;

      default:
        break;
    }
  }
}
