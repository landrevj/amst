/* eslint-disable no-restricted-syntax */
/* eslint-disable import/prefer-default-export */
import { basename, extname } from 'path';
import { FilterQuery, FindOptions } from '@mikro-orm/core';
import fg from 'fast-glob';
import StreamZip from 'node-stream-zip';
import { lookup } from 'mime-types';
import { difference, flattenDeep, sum, throttle, values } from 'lodash';
import log from 'electron-log';

import { DB } from '../../db';
import { Workspace, File, Folder, Group, GroupMember } from '../../db/entities';
import { chunk } from '../../utils';
import { SocketRequest, SocketRequestStatus, SocketResponse } from '../../utils/websocket';
import { EntityChannel } from './Entity';
import { ExtensionPercentagesGraphData } from '../../renderer/components/UI/Graphs/ExtensionPercentages';

const                  CHUNK_SIZE = 250;
const   PATH_DISCOVERY_CHUNK_SIZE = CHUNK_SIZE * 10;
const    MATCHED_PATHS_CHUNK_SIZE = CHUNK_SIZE;
const FILE_ASSOCIATION_CHUNK_SIZE = CHUNK_SIZE;
const        NEW_PATHS_CHUNK_SIZE = CHUNK_SIZE;

const ALLOWED_ZIP_EXTENSIONS = new Set(['zip', 'cbz']);

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
  async createAction(request: SocketRequest<[string, string[], boolean, boolean]>)
  {
    this.handleAction(request, ([name, paths, searchArchives, groupArchiveContents]) => {
      return this.create([name, searchArchives, groupArchiveContents], newWorkspace => {

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
  async fileStats(request: SocketRequest<number>)
  {
    this.handleAction(request, async (id) => {
      const em = DB.getNewEM();
      if (!em)
      {
        this.emitFailure(request);
        return [-1, -1];
      }

      const count = await em.count(File, { workspaces: id })

      // https://stackoverflow.com/a/37303878
      const counts: ExtensionPercentagesGraphData = await em.createQueryBuilder(File, 'f')
        .select(['f.extension', 'count(f.extension) as extension_count', 'count(f.extension) * 100.0 / sum(count(f.extension)) over () as extension_percent'])
        .leftJoin('f.workspaces', 'w')
        .where({ workspaces: id })
        .groupBy('f.extension')
        .orderBy({ 'count(f.extension)': 'desc' })
        .limit(10)
        .execute('all');

      const totalInCounts = counts.reduce((a, c) => a + c.extension_count, 0);
      const otherCount = count - totalInCounts;
      const totalCountPercent = (totalInCounts / count) * 100.0;
      const otherPercent = 100.0 - totalCountPercent;

      if (otherCount) counts.push({ extension: 'other', extension_count: otherCount, extension_percent: otherPercent });

      return [count, counts];
    });
  }

  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////
  async emitSyncUpdate(workspaceID: number, countDiscovered:number, countAdded: number, countGrouped: number, success?: boolean)
  {
    let status = SocketRequestStatus.RUNNING;
    if      (success === true)  status = SocketRequestStatus.SUCCESS;
    else if (success === false) status = SocketRequestStatus.FAILURE;

    this.getSocket()?.emit(`Workspace_${workspaceID}_sync`, {
      status,
      data: [countDiscovered, countAdded, countGrouped],
    } as SocketResponse<[number, number, number]>);
  }

  emitThrottledSyncUpdate = throttle(this.emitSyncUpdate, 100);

  async syncFiles(request: SocketRequest<number>)
  {
    /**
     * General Steps:
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

    const workspace = await em.findOne(Workspace, id);
    const searchArchives = workspace?.searchArchives;
    const groupArchiveContents = workspace?.groupArchiveContents;

    const promises: Promise<[number, number, number]>[] = [];

    const folders = await em.find(Folder, { workspace: id });
    const searchPaths = folders.map(folder => folder.path);
    searchPaths.forEach(folder => {

      const fn = async (): Promise<[number, number, number]> => {

        const pathStream = fg.stream('**/*', {
          cwd: folder,
          absolute: true,
          onlyFiles: true,
          unique: true,
          dot: true,
          suppressErrors: true,
        });

        const pathChunk: [string, string][] = Array(PATH_DISCOVERY_CHUNK_SIZE);
        for (let i = 0; i < PATH_DISCOVERY_CHUNK_SIZE; i += 1) pathChunk[i] = new Array(2) as [string, string];

        const archivePaths: [string, StreamZip.ZipEntry[]][] = [];
        let chunkLength = 0;
        let totalFilesDiscovered = 0;
        let totalFilesAdded = 0;
        let totalFilesGrouped = 0;
        for await (const filePath of pathStream)
        {
          const fp = filePath as string;
          pathChunk[chunkLength][0] = fp;
          pathChunk[chunkLength][1] = '';
          chunkLength += 1;
          totalFilesDiscovered += 1;

          if (chunkLength === PATH_DISCOVERY_CHUNK_SIZE)
          {
            totalFilesAdded += await WorkspaceChannel.syncPathChunk(id, pathChunk);
            chunkLength = 0;
          }
          this.emitThrottledSyncUpdate(id, totalFilesDiscovered, totalFilesAdded, 0);

          // if the file happens to be a zip file then parse the files within it as well
          if (searchArchives && ALLOWED_ZIP_EXTENSIONS.has(extname(fp).slice(1)))
          {
            // rude
            // eslint-disable-next-line new-cap
            const zip = new StreamZip.async({ file: fp, skipEntryNameValidation: true });
            const entries = values(await zip.entries()).filter(e => !e.isDirectory);
            for (const entry of entries)
            {
              const afp = entry.name;
              pathChunk[chunkLength][0] = fp;
              pathChunk[chunkLength][1] = afp;
              chunkLength += 1;
              totalFilesDiscovered += 1;

              // if we hit the chunk size we still send the chunk off to be persisted
              if (chunkLength === PATH_DISCOVERY_CHUNK_SIZE)
              {
                // eslint-disable-next-line no-await-in-loop
                totalFilesAdded += await WorkspaceChannel.syncPathChunk(id, pathChunk);
                chunkLength = 0;
              }
              this.emitThrottledSyncUpdate(id, totalFilesDiscovered, totalFilesAdded, 0);
            }
            await zip.close();
            // WorkspaceChannel.updateArchiveGroup(fp, entries);
            archivePaths.push([fp, entries]);
          }

        }
        if (chunkLength !== 0) // if we still have some files which need to get synced
        {
          totalFilesAdded += await WorkspaceChannel.syncPathChunk(id, pathChunk.slice(0, chunkLength));
          this.emitThrottledSyncUpdate(id, totalFilesDiscovered, totalFilesAdded, 0);
        }

        if (groupArchiveContents)
        {
          // we dont want to overload the ORM with too many pending operations so we await each individually
          for (let i = 0; i < archivePaths.length; i += 1)
          {
            const archive = archivePaths[i];
            // eslint-disable-next-line no-await-in-loop
            totalFilesGrouped += await WorkspaceChannel.updateArchiveGroup(archive[0], archive[1].map(e => e.name));
            this.emitThrottledSyncUpdate(id, totalFilesDiscovered, totalFilesAdded, totalFilesGrouped);
          }
        }

        return [totalFilesDiscovered, totalFilesAdded, totalFilesGrouped];
      }

      promises.push(fn());

    });

    const newFileCount = (await Promise.all(promises)).reduce((a,c) => [a[0]+c[0], a[1]+c[1], a[2]+c[2]], [0, 0, 0]);
    this.emitThrottledSyncUpdate(id, newFileCount[0], newFileCount[1], newFileCount[2], true);
  }

  static async syncPathChunk(workspaceID: number, pathChunk: [string, string][])
  {
    const em = DB.getNewEM();
    if (!em) return 0;

    const matchDict: { [path: string]: [string, string] } = {}; // <- c
    pathChunk.forEach(c => { matchDict[c.join('\\')] = c });

    // get all files already on the workspace //////////////////////////////////////////////////////////
    const promises: Promise<[string, string][]>[] = [];
    chunk(pathChunk, MATCHED_PATHS_CHUNK_SIZE * 2).forEach(paths => {
      const fn = async () => {
        const fromDB = await em.createQueryBuilder(File, 'f')
          .select('*')
          .leftJoin('f.workspaces', 'w')
          .where(`(f.file_path, f.archive_path) in (values ${paths.map(() => '(?,?)').join(',')})`, flattenDeep(paths))
          .andWhere({ workspaces: workspaceID })
          .getResult();

        em.clear();
        return fromDB.map(file => [file.filePath, file.archivePath]) as [string, string][];
      };
      promises.push(fn());
    });
    const existingFilesOnWorkspace = (await Promise.all(promises)).flat();
    // remove those from those we might need to create new file records for
    existingFilesOnWorkspace.forEach(path => delete matchDict[path.join('\\')]);
    em.clear();

    // get all files that are in the DB already but not associated with the workspace //////////////////
    const pathChunks = chunk(values(matchDict), MATCHED_PATHS_CHUNK_SIZE);
    const queryPromises: Promise<File[]>[] = [];

    pathChunks.forEach(paths => {
      const tempEM = DB.getNewEM();
      if (!tempEM) return;

      const eQB = tempEM.createQueryBuilder(File, 'f')
        .select('*')
        .leftJoin('f.workspaces', 'w')
        .where(`(f.file_path, f.archive_path) in (values ${paths.map(() => '(?,?)').join(',')})`, flattenDeep(paths))
        .groupBy('f.id')
        .having('sum(w.id = ?) = 0 or sum(w.id = ?) is NULL', [workspaceID, workspaceID]);

      queryPromises.push(eQB.getResult());
      tempEM.clear();
    });

    const existingFilesNotOnWorkspace = (await Promise.all(queryPromises)).flat();
    // this.emitSyncUpdate(workspaceID, `Found ${existingFilesNotOnWorkspace.length} pre-existing ${pluralize('file', existingFilesNotOnWorkspace.length)} in the DB...`);

    // remove existing files from those we might need to create new records for ////////////////////////
    existingFilesNotOnWorkspace.forEach(file => delete matchDict[[file.filePath, file.archivePath].join('\\')]);

    // associate the existing files with the current workspace /////////////////////////////////////////
    await WorkspaceChannel.associateFiles(workspaceID, existingFilesNotOnWorkspace);
    em.clear();

    // create new file records /////////////////////////////////////////////////////////////////////////
    const paths = values(matchDict);
    const newFiles: File[] = Array(paths.length);
    for (let i = 0; i < paths.length; i += 1)
    {
      const path = paths[i];

      const actualPath = path[1] !== '' ? path[1] : path[0]; // if the archive path is present we should be working on that

      const ext = extname(actualPath); // extname returns extensions with the dot if there was an extension
      const file = new File(basename(actualPath, ext), ext.slice(1), path[0], path[1]); // so we slice it before persisting it. ("".slice(1) is "")

      // calculate some metadata
      const mt = lookup(actualPath);
      if (mt) file.mimeType = mt;
      // file.md5      = md5File.sync(entry.path);

      em.persist(file);
      newFiles[i] = file;

      if (i % NEW_PATHS_CHUNK_SIZE === 0)
      {
        // eslint-disable-next-line no-await-in-loop
        await em.flush();
        em.clear();
        // this.emitSyncUpdate(workspaceID, `Importing new files to the DB... (${i + 1} of ${paths.length})`);
      }
    }
    await em.flush();
    em.clear();

    // associate the new records with the current workspace
    await WorkspaceChannel.associateFiles(workspaceID, newFiles);

    // return the total number of files we associated to the current workspace
    return existingFilesNotOnWorkspace.length + newFiles.length;
  }

  static async associateFiles(workspaceID: number, files: File[])// , filesDescription = 'files')
  {
    const promises: Promise<void>[] = [];

    const chunks = chunk(files, FILE_ASSOCIATION_CHUNK_SIZE);
    chunks.forEach(currentChunk => {
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
        // this.emitSyncUpdate(workspaceID, `Associating ${filesDescription} with workspace... (${(i + 1) * FILE_ASSOCIATION_CHUNK_SIZE} of ${files.length})`);
      };

      promises.push(fn());
    });

    await Promise.all(promises); // await all so we dont return until each chunk has persisted
  }

  static async updateArchiveGroup(filePath: string, archiveFilePaths: string[])
  {
    const em = DB.getNewEM();
    if (!em) return 0;

    const file = await em.findOne(File, { filePath }, ['managedGroups.members.file']);
    if (!file) return 0;

    const groups = file.managedGroups.getItems();
    if (groups.length === 0)
    {
      const g = new Group(file.name, file);
      file.managedGroups.add(g);
      groups.push(g);
    }

    const numberFilesGrouped = await Promise.all(groups.map(async group => {
      const memberFilePaths = group.members.getItems().map(member => member.file.archivePath);
      const missingFilePaths = difference(archiveFilePaths, memberFilePaths);

      const missingFiles = await WorkspaceChannel.chunkedCallback(missingFilePaths, CHUNK_SIZE, missingFileChunk => {
        const tem = DB.getNewEM();
        if (!tem) return new Promise(resolve => resolve([]));

        const missing = tem.find(File, { filePath, archivePath: missingFileChunk });
        tem.clear();
        return missing;
      });

      if (missingFiles.length)
      {
        missingFiles.forEach(f => group.members.add(new GroupMember(group, f)));
        await em.persistAndFlush(group);
      }

      return missingFiles.length;
    }));

    return sum(numberFilesGrouped);
  }

  static async chunkedCallback<T, U>(arr: T[], chunkSize: number, callback: (chnk: T[]) => Promise<U[]>)
  {
    // const promises: Promise<U[]>[] = [];
    const promises = chunk(arr, chunkSize).map(c => {
      return callback(c);
    });

    return (await Promise.all(promises)).flat();
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
      case 'file-stats':
        this.fileStats(request);
        break;
      case 'syncFiles':
        this.syncFiles(request);
        break;

      default:
        break;
    }
  }
}
