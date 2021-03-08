/* eslint-disable @typescript-eslint/lines-between-class-members */
import { EntityManager, MikroORM } from "@mikro-orm/core";
import log from 'electron-log';
import config from '../mikro-orm.config';

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
    // eslint-disable-next-line promise/always-return
    await MikroORM.init(config).then((orm) => {
      // console.log('DB.ts: connected');
      log.info('DB.ts: Database connected');
      log.debug(config);

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
