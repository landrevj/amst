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
    /** Sync Process
     *
     * a - get all files and folders on current workspace
     * b = list of all files on the workspace
     * c = set of all file paths matched from workspace's folders
     *
     * d - remove all paths from c found in b
     * c is now a set of all files matched from workspace's folders which weren't found on a file associated with the workspace
     *
     * e = query all files with paths from c which exist in the DB (these will be existing files in the DB which were matched from the workspace's folders but werent associated with it)
     * f - remove all paths from c found in e
     * c is now a set of all file paths matched from the workspace's folders which weren't found on any file in the DB
     *
     * g - associate all of e to the current workspace
     * h - add all paths in c to the workspace as new files
     *
     */

    if (!request.params) return;
    const id = request.params;

    let em = DB.getNewEM();

    // a ///////////////////////////////////////////////////////////////////////////////////////////////
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
    // b ///////////////////////////////////////////////////////////////////////////////////////////////
    const existingFilesOnWorkspace = workspace.files.getItems();
    // c ///////////////////////////////////////////////////////////////////////////////////////////////
    const searchPaths = workspace.folders.getItems().map(folder => folder.path);
    const matches     = (await Promise.all(glob(searchPaths))).flat();
    const matchSet = new Set(matches.map(entry => entry.path)); // <- c
    // d ///////////////////////////////////////////////////////////////////////////////////////////////
    existingFilesOnWorkspace.forEach(file => matchSet.delete(file.fullPath));
    // e ///////////////////////////////////////////////////////////////////////////////////////////////
    const eQB = em?.createQueryBuilder(File, 'f')
      .select('*')
      .leftJoin('f.workspaces', 'w')
      .where({ fullPath: Array.from(matchSet) })
      .groupBy('f.id')
      .having('sum(w.id = ?) = 0', [workspace.id]);

    const existingFilesNotOnWorkspace = await eQB?.getResult();
    if (!existingFilesNotOnWorkspace)
    {
      this.emitFailure(request);
      return;
    }
    this.emitSyncUpdate(workspace.id, `Found ${existingFilesNotOnWorkspace.length} pre-existing files in the DB...`);
    // f ///////////////////////////////////////////////////////////////////////////////////////////////
    existingFilesNotOnWorkspace.forEach(file => matchSet.delete(file.fullPath));
    // g ///////////////////////////////////////////////////////////////////////////////////////////////
    for (let i = 0; i < existingFilesNotOnWorkspace.length; i += 1)
    {
      const file = existingFilesNotOnWorkspace[i];
      workspace.files.add(file);
      em?.persist(workspace);

      // @see https://github.com/mikro-orm/mikro-orm/issues/732#issuecomment-671874524
      // eslint-disable-next-line no-await-in-loop
      if (i % 100 === 0) await em?.flush();
    }
    await em?.flush();
    em?.clear();

    // get a new em and a new workspace so our identity map isnt overpopulated and we can actually insert with any degree of performance
    em = DB.getNewEM();
    const newWorkspace = await em?.findOne(Workspace, id).catch(error => {
      log.error(error);
      this.emitFailure(request);
    });

    if (!newWorkspace)
    {
      this.emitFailure(request);
      return;
    }

    // h ///////////////////////////////////////////////////////////////////////////////////////////////
    const paths = Array.from(matchSet);
    for (let i = 0; i < paths.length; i += 1)
    {
      const path = paths[i];
      this.emitSyncUpdate(newWorkspace.id, `Importing new file ${i + 1} of ${paths.length} to the DB...`);

      const ext = extname(path); // extname returns extensions with the dot if there was an extension
      const file = new File(basename(path, ext), ext.slice(1), path); // so we slice it before persisting it. ("".slice(1) is "")

      // calculate some metadata
      const mt = lookup(path);
      if (mt) file.mimeType = mt;
      // file.md5      = md5File.sync(entry.path);

      newWorkspace.files.add(file);
      em?.persist(newWorkspace);

      // @see https://github.com/mikro-orm/mikro-orm/issues/732#issuecomment-671874524
      // eslint-disable-next-line no-await-in-loop
      if (i % 100 === 0) await em?.flush();
    }
    await em?.flush();
    em?.clear();
    // DONE!

    const newFileCount = existingFilesNotOnWorkspace.length + paths.length;
    this.emitSyncUpdate(workspace.id, `Added ${newFileCount} files to the workspace!`, true);
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
