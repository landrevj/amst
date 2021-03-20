/* eslint-disable import/prefer-default-export */
import { PrimaryKey } from '@mikro-orm/core'

export abstract class BaseEntity {

  @PrimaryKey({ type: 'number' })
  id!: number;

  // @Property()
  // createdAt: Date = new Date();

  // @Property({ onUpdate: () => new Date() })
  // updatedAt: Date = new Date();

}

export interface BaseEntityStub
{
  id: number;
}
