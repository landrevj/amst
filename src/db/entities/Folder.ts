/* eslint-disable import/prefer-default-export */
import { Entity, ManyToOne, Property } from '@mikro-orm/core'

// eslint-disable-next-line import/no-cycle
import { Workspace, WorkspaceStub } from './index';
import { BaseEntity, BaseEntityStub } from './BaseEntity';

@Entity()
export class Folder extends BaseEntity
{

  @Property({ type: 'string' })
  path!: string;

  @ManyToOne(() => Workspace)
  workspace!: Workspace;

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
