/* eslint-disable @typescript-eslint/lines-between-class-members */
import { MikroORM, Options } from "@mikro-orm/core";
import { EntityManager, SqliteDriver } from '@mikro-orm/sqlite';
import { join } from 'path';
import config from '../mikro-orm.config';
import { IpcService } from '../utils/ipc';

class Database
{
  private static instance: Database;

  private private_orm: MikroORM<SqliteDriver> | undefined;

  private constructor() { /* do nothing */ }

  public static getInstance(): Database {
    if (!Database.instance) Database.instance = new Database();
    return Database.instance;
  }

  public async init()
  {
    const conf: Options<SqliteDriver> = { ...config };
    if (process.env.NODE_ENV === 'production')
    {
      const ipc           = new IpcService();
      const userDataPath  = await ipc.send<string>('app-path', { params: ['userData'] });
      const prodDBPath    = join(userDataPath, 'database.sqlite');

      conf.dbName = prodDBPath;
    }
    else if (process.env.NODE_ENV === 'development')
    {
      conf.dbName = './src/db/dev_database.sqlite';
    }

    const orm = await MikroORM.init(conf);
    this.private_orm = orm;
  }

  get orm(): MikroORM<SqliteDriver> | undefined { return this.private_orm }

  getNewEM(): EntityManager | undefined { return this.orm?.em.fork() }
}

const DB = Database.getInstance();
export default DB;
