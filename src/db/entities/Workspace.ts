/* eslint-disable import/prefer-default-export */
import { Entity, ManyToMany, Property, Collection, Unique } from '@mikro-orm/core'

// eslint-disable-next-line import/no-cycle
import { File, FileStub, Folder, FolderStub } from './index';
import { BaseEntity, BaseEntityStub } from './BaseEntity';

@Entity()
export class Workspace extends BaseEntity
{

  @Property({ type: 'string' })
  @Unique()
  name!: string;

  @ManyToMany(() => File, 'workspaces', { owner: true })
  files = new Collection<File>(this);

  @ManyToMany(() => Folder, 'workspaces', { owner: true })
  folders = new Collection<Folder>(this);

  constructor(name: string)
  {
    super();
    this.name = name;
  }

}

export interface WorkspaceStub extends BaseEntityStub
{
  name: string;
  files?: FileStub[] | number[];
  folders?: FolderStub[] | number[];
}
