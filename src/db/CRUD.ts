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
    const em = DB.getNewEM();
    // DB TRANSACTION START /////////////////////////////////////////////
    const entity = await em?.transactional<EntityType>(t_em => {

      const newEntity = new this.Entity(...args);

      if (callback) callback(newEntity);

      t_em.persist(newEntity);

      return new Promise(resolve => {
        resolve(newEntity);
      });

    });
    // DB TRANSACTION END ///////////////////////////////////////////////

    return entity;
  }

  async read(where: FilterQuery<EntityType> = {}, options: FindOptions<EntityType> = {})
  {
    const em = DB.getNewEM();
    const entities = await em?.find<EntityType>(this.Entity, where, options);

    return entities;
  }

  // async update(id: Primary<EntityType> | Primary<EntityType>[], data: any, options?: AssignOptions | boolean)
  // {
  //   const em = DB.getNewEM();

  //   const ref = em?.getReference<EntityType>(this.Entity, id);
  //   wrap(ref).assign(data, options);


  // }

  async destroy(where: FilterQuery<EntityType>)
  {
    const em = DB.getNewEM();
    const entities = await em?.find(this.Entity, where);
    if (entities)
    {
      await em?.removeAndFlush(entities);
      return true;
    }
    return false;
  }

}
