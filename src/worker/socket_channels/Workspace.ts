/* eslint-disable import/prefer-default-export */
import { basename, extname } from 'path';
import { FilterQuery, FindOptions } from '@mikro-orm/core';
import { lookup } from 'mime-types';
import pluralize from 'pluralize';
import log from 'electron-log';

import { DB } from '../../db';
import { Workspace, File, Folder } from '../../db/entities';
import { chunk, glob } from '../../utils';
import { SocketRequest, SocketRequestStatus, SocketResponse } from '../../utils/websocket';
import { EntityChannel } from './Entity';

const CHUNK_SIZE = 250;
const MATCHED_PATHS_CHUNK_SIZE    = CHUNK_SIZE;
const FILE_ASSOCIATION_CHUNK_SIZE = CHUNK_SIZE;
const     NEW_PATHS_CHUNK_SIZE    = CHUNK_SIZE;

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
     * c is now a set of all file paths matched from workspace's folders which weren't found on a file associated with the workspace
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

    const em = DB.getNewEM();
    if (!em)
    {
      this.emitFailure(request);
      return;
    }

    // a ///////////////////////////////////////////////////////////////////////////////////////////////
    const workspace = await em.findOne(Workspace, id, ['files', 'folders']).catch(error => {
      log.error(error);
      this.emitFailure(request);
    });

    if (!workspace)
    {
      this.emitFailure(request);
      return;
    }

    // respond to inital sync request
    this.getSocket()?.emit(request.responseChannel as string, { status: SocketRequestStatus.SUCCESS } as SocketResponse<void>);
    // emit general sync update message
    this.emitSyncUpdate(workspace.id, 'Started sync...');

    // b ///////////////////////////////////////////////////////////////////////////////////////////////
    const existingFilesOnWorkspace = workspace.files.getItems();
    // c ///////////////////////////////////////////////////////////////////////////////////////////////
    this.emitSyncUpdate(workspace.id, 'Searching for files (this might take a while)...');
    const searchPaths = workspace.folders.getItems().map(folder => folder.path);
    const matches     = (await Promise.all(glob(searchPaths))).flat();
    const matchSet = new Set(matches.map(entry => entry.path)); // <- c
    // d ///////////////////////////////////////////////////////////////////////////////////////////////
    existingFilesOnWorkspace.forEach(file => matchSet.delete(file.fullPath));
    // e ///////////////////////////////////////////////////////////////////////////////////////////////
    const pathChunks = chunk(Array.from(matchSet), MATCHED_PATHS_CHUNK_SIZE);
    const queryPromises: Promise<File[]>[] = [];

    pathChunks.forEach(pathChunk => {
      const tempEM = DB.getNewEM();
      if (!tempEM) return;

      const eQB = tempEM.createQueryBuilder(File, 'f')
        .select('*')
        .leftJoin('f.workspaces', 'w')
        .where({ fullPath: pathChunk })
        .groupBy('f.id')
        .having('sum(w.id = ?) = 0 or sum(w.id = ?) is NULL', [workspace.id, workspace.id]);

      queryPromises.push(eQB.getResult());
      tempEM.clear();
    });

    const existingFilesNotOnWorkspace = (await Promise.all(queryPromises)).flat();
    // log.info(existingFilesNotOnWorkspace);

    this.emitSyncUpdate(workspace.id, `Found ${existingFilesNotOnWorkspace.length} pre-existing ${pluralize('file', existingFilesNotOnWorkspace.length)} in the DB...`);
    // f ///////////////////////////////////////////////////////////////////////////////////////////////
    existingFilesNotOnWorkspace.forEach(file => matchSet.delete(file.fullPath));
    // g ///////////////////////////////////////////////////////////////////////////////////////////////
    await this.associateFiles(workspace.id, existingFilesNotOnWorkspace, 'existing files');
    // h ///////////////////////////////////////////////////////////////////////////////////////////////
    const paths = Array.from(matchSet);
    const newFiles: File[] = Array(paths.length);
    for (let i = 0; i < paths.length; i += 1)
    {
      const path = paths[i];

      const ext = extname(path); // extname returns extensions with the dot if there was an extension
      const file = new File(basename(path, ext), ext.slice(1), path); // so we slice it before persisting it. ("".slice(1) is "")

      // calculate some metadata
      const mt = lookup(path);
      if (mt) file.mimeType = mt;
      // file.md5      = md5File.sync(entry.path);

      em?.persist(file);
      newFiles[i] = file;

      if (i % NEW_PATHS_CHUNK_SIZE === 0)
      {
        // eslint-disable-next-line no-await-in-loop
        await em?.flush();
        em?.clear();
        this.emitSyncUpdate(workspace.id, `Importing new files to the DB... (${i + 1} of ${paths.length})`);
      }
    }
    await em?.flush();
    em?.clear();

    await this.associateFiles(workspace.id, newFiles, 'new files');
    // DONE ////////////////////////////////////////////////////////////////////////////////////////////

    const newFileCount = existingFilesNotOnWorkspace.length + paths.length;
    this.emitSyncUpdate(workspace.id, `Added ${pluralize('file', newFileCount, true)} to the workspace!`, true);
  }

  async associateFiles(workspaceID: number, files: File[], filesDescription = 'files')
  {
    const promises: Promise<void>[] = [];

    const chunks = chunk(files, FILE_ASSOCIATION_CHUNK_SIZE);
    chunks.forEach((currentChunk, i) => {
      // use an async lambda rather than just making the current function we are in async so
      // we can syncronously build a list of promises for each chunk, then await them all together
      const fn = async () => {
        const em = DB.getNewEM();
        if (!em) return;

        const workspace = await em.findOne(Workspace, workspaceID).catch(log.error);
        if (workspace)
        {
          workspace.files.add(...currentChunk);
          em.persist(workspace);
        }
        await em.flush();
        em.clear();
        this.emitSyncUpdate(workspaceID, `Associating ${filesDescription} with workspace... (${(i + 1) * FILE_ASSOCIATION_CHUNK_SIZE} of ${files.length})`);
      };

      promises.push(fn());
    });

    await Promise.all(promises); // await all so we dont return until each chunk has persisted
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
