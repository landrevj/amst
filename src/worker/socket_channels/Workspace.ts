/* eslint-disable import/prefer-default-export */
import { FilterQuery, FindOptions } from '@mikro-orm/core';
import log from 'electron-log';

import { DB } from '../../db';
import { Workspace, File, Folder } from '../../db/entities';
import { arrayDifference, filenameExtension, glob } from '../../utils';
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
    this.getSocket()?.emit(`Workspace_${workspace.id}_sync`, { status: SocketRequestStatus.RUNNING, data: 'Started sync...' } as SocketResponse<string>);

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
    let existingFilesNotOnWorkspace: File[] = [];
    if (existingFilesFromMatches) existingFilesNotOnWorkspace = arrayDifference(existingFilesFromMatches, existingFilesOnWorkspace, file1 => file1.fullPath, file2 => file2.fullPath);

    this.getSocket()?.emit(`Workspace_${workspace.id}_sync`, {
      status: SocketRequestStatus.RUNNING,
      data: `Found ${existingFilesNotOnWorkspace.length} pre-existing files...`
    } as SocketResponse<string>);

    // e
    const entriesNotOnWorkspace = arrayDifference(matches, existingFilesOnWorkspace, entry => entry.path, file => file.fullPath);
    const entriesNotInDB = arrayDifference(entriesNotOnWorkspace, existingFilesNotOnWorkspace, entry => entry.path, file => file.fullPath);

    this.getSocket()?.emit(`Workspace_${workspace.id}_sync`, {
      status: SocketRequestStatus.RUNNING,
      data: `Found ${entriesNotInDB.length} new files...`
    } as SocketResponse<string>);

    // DB TRANSACTION START //////////////////////////////////////////////
    const updatedWorkspace = await em?.transactional<Workspace>(t_em => {

      // f
      existingFilesNotOnWorkspace.forEach(file => {
        workspace.files.add(file);
      });

      // g
      entriesNotInDB.forEach(entry => {
        workspace.files.add(new File(entry.name, filenameExtension(entry.name), entry.path))
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

      this.getSocket()?.emit(`Workspace_${workspace.id}_sync`, {
        status: SocketRequestStatus.SUCCESS,
        data: `Added ${newFileCount} files to the workspace!`
      } as SocketResponse<string>);

      return;
    }

    this.getSocket()?.emit(`Workspace_${workspace.id}_sync`, {
      status: SocketRequestStatus.FAILURE,
      data: `DB transaction failed!`
    } as SocketResponse<string>);

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
