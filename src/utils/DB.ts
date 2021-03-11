/* eslint-disable @typescript-eslint/lines-between-class-members */
import { EntityManager, MikroORM, Options } from "@mikro-orm/core";
import { join } from 'path';
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
    const userDataPath  = await ipc.send<string>('app-path', { params: ['userData'] });
    const prodDBPath    = process.env.NODE_ENV === 'production' && join(userDataPath, 'database.sqlite');
    const conf: Options = { ...config };
    if (prodDBPath) conf.dbName = prodDBPath;

    const orm = await MikroORM.init(conf);
    this.private_orm = orm;
    this.private_em  = orm.em;
  }

  get orm(): MikroORM      | undefined { return this.private_orm }
  get  em(): EntityManager | undefined { return this.private_em }

}

const DB = Database.getInstance();
export default DB;
