/* eslint-disable @typescript-eslint/no-explicit-any */
import { FilterQuery, FindOptions } from '@mikro-orm/core';
import DB from './DB';

export default class CRUD<EntityType>
{

  private Entity!: new (...args: any[]) => EntityType;

  constructor(entity: new (...args: any[]) => EntityType)
  {
    this.Entity = entity;
  }

  async create(args: any[], callback?: (entity: EntityType) => void)
  {
    // DB TRANSACTION START /////////////////////////////////////////////
    const entity = await DB.em?.transactional<EntityType>(em => {

      const newEntity = new this.Entity(...args);

      if (callback) callback(newEntity);

      em.persist(newEntity);

      return new Promise(resolve => {
        resolve(newEntity);
      });

    });
    // DB TRANSACTION END ///////////////////////////////////////////////

    return entity;
  }

  async read(where: FilterQuery<EntityType> = {}, options: FindOptions<EntityType> = {})
  {
    const entities = await DB.em?.find<EntityType>(this.Entity, where, options);

    return entities;
  }

  // update()

  async destroy(where: FilterQuery<EntityType>)
  {
    const entities = await DB.em?.find(this.Entity, where);
    if (entities)
    {
      await DB.em?.removeAndFlush(entities);
      return true;
    }
    return false;
  }

}
