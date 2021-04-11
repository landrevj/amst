/* eslint-disable import/prefer-default-export */
import { PrimaryKey, Property } from '@mikro-orm/core'

export abstract class BaseEntity {

  @PrimaryKey({ type: 'number' })
  id!: number;

  @Property({ type: Date })
  createdAt: Date = new Date();

  @Property({ type: Date, onUpdate: () => new Date() })
  updatedAt: Date = new Date();

}

export interface BaseEntityStub
{
  id: number;
  createdAt: string;
  updatedAt: string;
}
