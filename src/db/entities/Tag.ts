/* eslint-disable import/prefer-default-export */
import { Entity, ManyToOne, Property, Unique } from '@mikro-orm/core'

// eslint-disable-next-line import/no-cycle
import { File, FileStub } from './index';
import { BaseEntity, BaseEntityStub } from './BaseEntity';

@Entity()
@Unique({ properties: ['name', 'category', 'file'] })
export class Tag extends BaseEntity
{

  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string' })
  category!: string;

  @ManyToOne(() => File)
  file!: File;

  constructor(name: string, category = '')
  {
    super();
    this.name = name;
    this.category = category;
  }
}

export interface TagStub extends BaseEntityStub
{
  name: string;
  category: string;
  file?: FileStub;
}
