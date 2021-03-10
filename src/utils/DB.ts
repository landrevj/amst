/* eslint-disable @typescript-eslint/lines-between-class-members */
import { EntityManager, MikroORM, Options } from "@mikro-orm/core";
import { join } from 'path';
import log from 'electron-log';
import config from '../mikro-orm.config';
import { IpcService } from './ipc';

class Database
{

  private static instance: Database;

  private private_orm: MikroORM | undefined;
  private  private_em: EntityManager | undefined;

  private constructor() { /* do nothing */ }

  public static getInstance(): Database {
    if (!Database.instance) Database.instance = new Database();
    return Database.instance;
  }

  public async init()
  {
    const ipc           = new IpcService();
    const prodDBPath    = process.env.NODE_ENV === 'production' && join(await ipc.send<string>('app-path', { params: ['userData'] }), 'database.sqlite');
    const conf: Options = { ...config };
    if (prodDBPath) conf.dbName = prodDBPath;

    // eslint-disable-next-line promise/always-return
    await MikroORM.init(conf).then((orm) => {
      // console.log('DB.ts: connected');
      log.info('DB.ts: Database connected');
      log.debug(conf);

      this.private_orm = orm;
      this.private_em  = orm.em;

    // }).catch(console.log);
    }).catch(log.catchErrors);
  }

  get orm(): MikroORM      | undefined { return this.private_orm }
  get  em(): EntityManager | undefined { return this.private_em }

}

const DB = Database.getInstance();
export default DB;
