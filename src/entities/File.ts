/* eslint-disable import/prefer-default-export */
import { Entity, ManyToMany, Property, Collection, Unique } from '@mikro-orm/core'

// eslint-disable-next-line import/no-cycle
import { Workspace } from './index';
import { BaseEntity } from './BaseEntity';

@Entity()
export class File extends BaseEntity
{

  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string' })
  extension!: string;

  @Property({ type: 'string' })
  @Unique()
  fullPath!: string;

  @ManyToMany(() => Workspace, workspace => workspace.files)
  workspaces = new Collection<Workspace>(this);

  constructor(name: string, extension: string, fullPath: string)
  {
    super();
    this.name      = name;
    this.extension = extension;
    this.fullPath  = fullPath;
  }

}
