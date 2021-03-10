/* eslint-disable import/prefer-default-export */
import { Entity, ManyToMany, PrimaryKey, Property, Collection } from '@mikro-orm/core'

// @see https://mikro-orm.io/docs/installation#possible-issues-with-circular-dependencies
// eslint-disable-next-line import/no-cycle
import { Workspace } from './Workspace';

@Entity()
export class File
{

  @PrimaryKey({ type: 'number' })
  id!: number;

  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string' })
  extension!: string;

  @Property({ type: 'string' })
  fullPath!: string;

  @ManyToMany(() => Workspace, workspace => workspace.files)
  workspaces = new Collection<Workspace>(this);

  constructor(name: string, extension: string, fullPath: string)
  {
    this.name      = name;
    this.extension = extension;
    this.fullPath  = fullPath;
  }

}
