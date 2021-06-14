/* eslint-disable import/prefer-default-export */
import { Entity, ManyToOne, Property, Unique } from '@mikro-orm/core'

// eslint-disable-next-line import/no-cycle
import { File, FileStub, Group, GroupStub } from './index';
import { BaseEntity, BaseEntityStub } from './BaseEntity';

@Entity()
@Unique({ properties: ['name', 'category', 'file'] })
@Unique({ properties: ['name', 'category', 'group'] })
export class Tag extends BaseEntity
{

  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string' })
  category!: string;

  @ManyToOne(() => File)
  file!: File;

  @ManyToOne(() => Group)
  group!: Group;

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
  group?: GroupStub;
}
