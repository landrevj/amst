import 'reflect-metadata';
import log from 'electron-log';

import DB from '../db/DB';
import Server from '../utils/websocket/SocketServer';
import { FileChannel, FolderChannel, TagChannel, WorkspaceChannel } from './socket_channels';

// eslint-disable-next-line import/prefer-default-export
export async function main()
{
  // init the database before starting the socket.io server
  const migration = await DB.init().then(() => {

    log.debug('worker/index.ts: Will run migrations up through current...');
    return DB.orm?.getMigrator().up();

  }).catch(log.catchErrors);

  if (!migration) throw new Error('worker/index.tsx: Failed to run migrations!');
  log.debug('worker/index.ts: Migrations were successful.');

  Server.init([
    new TagChannel(),
    new FileChannel(),
    new FolderChannel(),
    new WorkspaceChannel(),
  ]);
}
