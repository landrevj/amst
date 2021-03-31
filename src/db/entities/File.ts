/* eslint-disable import/prefer-default-export */
import { Entity, ManyToMany, OneToMany, Property, Collection, Unique } from '@mikro-orm/core'

// eslint-disable-next-line import/no-cycle
import { Workspace, WorkspaceStub, Tag, TagStub } from './index';
import { BaseEntity, BaseEntityStub } from './BaseEntity';

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

  @Property({ type: 'string', nullable: true })
  mimeType?: string;

  @Property({ type: 'string', nullable: true })
  md5?: string;

  @ManyToMany(() => Workspace, workspace => workspace.files)
  workspaces = new Collection<Workspace>(this);

  @OneToMany({ entity: () => Tag, mappedBy: 'file', orphanRemoval: true })
  tags = new Collection<Tag>(this);

  constructor(name: string, extension: string, fullPath: string)
  {
    super();
    this.name      = name;
    this.extension = extension;
    this.fullPath  = fullPath;
  }

}

export interface FileStub extends BaseEntityStub
{
  name: string;
  extension: string;
  fullPath: string;
  mimeType?: string;
  md5?: string;
  workspaces?: WorkspaceStub[];
  tags?: TagStub[];
}
