/* eslint-disable import/prefer-default-export */
import { Entity, ManyToMany, Property, Collection, Unique, OneToMany } from '@mikro-orm/core'

// eslint-disable-next-line import/no-cycle
import { File, FileStub, Folder, FolderStub } from './index';
import { BaseEntity, BaseEntityStub } from './BaseEntity';

@Entity()
export class Workspace extends BaseEntity
{

  @Property({ type: 'string' })
  @Unique()
  name!: string;

  @ManyToMany(() => File, file => file.workspaces, { owner: true })
  files = new Collection<File>(this);

  @OneToMany({ entity: () => Folder, mappedBy: 'workspace', orphanRemoval: true })
  folders = new Collection<Folder>(this);

  @Property({ type: 'boolean' })
  searchArchives = false;

  @Property({ type: 'boolean' })
  groupArchiveContents = false;

  constructor(name: string, searchArchives = false, groupArchiveContents = false)
  {
    super();
    this.name = name;
    this.searchArchives = searchArchives;
    this.groupArchiveContents = searchArchives ? groupArchiveContents : false;
  }

}

export interface WorkspaceStub extends BaseEntityStub
{
  name: string;
  files?: FileStub[] | number[];
  folders?: FolderStub[] | number[];
  searchArchives: boolean;
  groupArchiveContents: boolean;
}
