/* eslint-disable import/prefer-default-export */
import { Entity, ManyToMany, Property, Collection, Unique } from '@mikro-orm/core'

// eslint-disable-next-line import/no-cycle
import { Workspace } from './index';
import { BaseEntity } from './BaseEntity';

@Entity()
export class Folder extends BaseEntity
{

  // @PrimaryKey({ type: 'number' })
  // id!: number;

  @Property({ type: 'string' })
  @Unique()
  path!: string;

  @ManyToMany(() => Workspace, workspace => workspace.folders)
  workspaces = new Collection<Workspace>(this);

  constructor(path: string)
  {
    super();
    this.path = path;
  }

}
