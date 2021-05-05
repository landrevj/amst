/* eslint-disable import/prefer-default-export */
import { basename, extname } from 'path';
import { FilterQuery, FindOptions } from '@mikro-orm/core';
import fg from 'fast-glob';
import { lookup } from 'mime-types';
import pluralize from 'pluralize';
import log from 'electron-log';

import { DB } from '../../db';
import { Workspace, File, Folder } from '../../db/entities';
import { chunk } from '../../utils';
import { SocketRequest, SocketRequestStatus, SocketResponse } from '../../utils/websocket';
import { EntityChannel } from './Entity';

const                  CHUNK_SIZE = 250;
const   PATH_DISCOVERY_CHUNK_SIZE = CHUNK_SIZE * 10;
const    MATCHED_PATHS_CHUNK_SIZE = CHUNK_SIZE;
const FILE_ASSOCIATION_CHUNK_SIZE = CHUNK_SIZE;
const        NEW_PATHS_CHUNK_SIZE = CHUNK_SIZE;

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
    /**
     * General Process Steps:
     *
     * a - get all folders on current workspace
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
     * This differs in order somewhat from the actual implementation below. In order to keep performance up and memory useage down,
     * we heavily chunk queries when we ask for things from the DB since MikroORM uses an Identity Map. Typically, the Identity Map is very useful
     * elsewhere in the application, however here it tends to get overpopulated which significantly reduces our ability to meet the performance
     * targets listed above.
     *
     * https://github.com/mikro-orm/mikro-orm/issues/732#issuecomment-671874524
     */

    if (!request.params) return;
    const id = request.params;


    const em = DB.getNewEM();
    if (!em)
    {
      this.emitFailure(request);
      return;
    }

    // respond to inital sync request
    this.getSocket()?.emit(request.responseChannel as string, { status: SocketRequestStatus.SUCCESS } as SocketResponse<void>);
    // emit general sync update message
    this.emitSyncUpdate(id, 'Started sync...');

    const promises: Promise<number>[] = [];

    const folders = await em.find(Folder, { workspace: id });
    console.log(folders);
    const searchPaths = folders.map(folder => folder.path);
    searchPaths.forEach(folder => {

      const fn = async () => {

        const pathStream = fg.stream('**/*', {
          cwd: folder,
          absolute: true,
          onlyFiles: true,
          unique: true,
          dot: true,
          suppressErrors: true,
        });

        const pathChunk: string[] = Array(PATH_DISCOVERY_CHUNK_SIZE);
        let chunkLength = 0;
        let totalAddedFiles = 0;
        // eslint-disable-next-line no-restricted-syntax
        for await (const filePath of pathStream)
        {
          pathChunk[chunkLength] = filePath as string;
          chunkLength += 1;

          if (chunkLength === PATH_DISCOVERY_CHUNK_SIZE)
          {
            totalAddedFiles += await this.syncPathChunk(id, pathChunk);
            chunkLength = 0;
          }
        }
        if (chunkLength !== 0)
        {
          totalAddedFiles += await this.syncPathChunk(id, pathChunk.slice(0, chunkLength));
        }

        return totalAddedFiles;
      }

      promises.push(fn());

    });
    // DONE ////////////////////////////////////////////////////////////////////////////////////////////

    const newFileCount = (await Promise.all(promises)).reduce((a,c) => a + c, 0);
    this.emitSyncUpdate(id, `Added ${pluralize('file', newFileCount, true)} to the workspace!`, true);
  }

  async syncPathChunk(workspaceID: number, pathChunk: string[])
  {
    const em = DB.getNewEM();
    if (!em) return 0;

    const matchSet = new Set(pathChunk); // <- c

    // get all files already on the workspace //////////////////////////////////////////////////////////
    const promises: Promise<string[]>[] = [];
    chunk(pathChunk, MATCHED_PATHS_CHUNK_SIZE * 2).forEach(c => {
      const fn = async () => {
        const fromDB = await em.find(File, { fullPath: c, workspaces: { id: workspaceID } });
        em.clear();
        return fromDB.map(file => file.fullPath);
      };
      promises.push(fn());
    });
    const existingFilesOnWorkspace = (await Promise.all(promises)).flat();
    // remove those from those we might need to create new file records for
    existingFilesOnWorkspace.forEach(path => matchSet.delete(path));

    // get all files that are in the DB already but not associated with the workspace //////////////////
    const pathChunks = chunk(Array.from(matchSet), MATCHED_PATHS_CHUNK_SIZE);
    const queryPromises: Promise<File[]>[] = [];

    pathChunks.forEach(paths => {
      const tempEM = DB.getNewEM();
      if (!tempEM) return;

      const eQB = tempEM.createQueryBuilder(File, 'f')
        .select('*')
        .leftJoin('f.workspaces', 'w')
        .where({ fullPath: paths })
        .groupBy('f.id')
        .having('sum(w.id = ?) = 0 or sum(w.id = ?) is NULL', [workspaceID, workspaceID]);

      queryPromises.push(eQB.getResult());
      tempEM.clear();
    });

    const existingFilesNotOnWorkspace = (await Promise.all(queryPromises)).flat();
    this.emitSyncUpdate(workspaceID, `Found ${existingFilesNotOnWorkspace.length} pre-existing ${pluralize('file', existingFilesNotOnWorkspace.length)} in the DB...`);

    // remove existing files from those we might need to create new records for ////////////////////////
    existingFilesNotOnWorkspace.forEach(file => matchSet.delete(file.fullPath));

    // associate the existing files with the current workspace /////////////////////////////////////////
    await this.associateFiles(workspaceID, existingFilesNotOnWorkspace, 'existing files');

    // create new file records /////////////////////////////////////////////////////////////////////////
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
        this.emitSyncUpdate(workspaceID, `Importing new files to the DB... (${i + 1} of ${paths.length})`);
      }
    }
    await em?.flush();
    em?.clear();

    // associate the new records with the current workspace
    await this.associateFiles(workspaceID, newFiles, 'new files');

    // return the total number of files we associated to the current workspace
    return existingFilesNotOnWorkspace.length + newFiles.length;
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
