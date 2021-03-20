/* eslint-disable import/prefer-default-export */
import { Entity, ManyToMany, Property, Collection } from '@mikro-orm/core'

// eslint-disable-next-line import/no-cycle
import { Workspace, WorkspaceStub } from './index';
import { BaseEntity, BaseEntityStub } from './BaseEntity';

@Entity()
export class Folder extends BaseEntity
{

  @Property({ type: 'string' })
  path!: string;

  @ManyToMany(() => Workspace, workspace => workspace.folders)
  workspaces = new Collection<Workspace>(this);

  constructor(path: string)
  {
    super();
    this.path = path;
  }

}

export interface FolderStub extends BaseEntityStub
{
  path: string;
  workspaces?: WorkspaceStub[];
}
