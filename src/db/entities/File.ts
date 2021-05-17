/* eslint-disable import/prefer-default-export */
import { Entity, ManyToMany, OneToMany, Property, Collection, Unique } from '@mikro-orm/core'

// eslint-disable-next-line import/no-cycle
import { Workspace, WorkspaceStub, Tag, TagStub, Group, GroupStub, GroupMember, GroupMemberStub } from './index';
import { BaseEntity, BaseEntityStub } from './BaseEntity';

@Entity()
@Unique({ properties: ['filePath', 'archivePath'] })
export class File extends BaseEntity
{

  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string' })
  extension!: string;

  @Property({ type: 'string' })
  filePath!: string;

  @Property({ type: 'string' })
  archivePath!: string;

  @Property({ type: 'string', nullable: true })
  mimeType?: string;

  @Property({ type: 'string', nullable: true })
  md5?: string;

  @ManyToMany(() => Workspace, workspace => workspace.files)
  workspaces = new Collection<Workspace>(this);

  @OneToMany({ entity: () => Tag, mappedBy: 'file', orphanRemoval: true })
  tags = new Collection<Tag>(this);

  @OneToMany({ entity: () => Group, mappedBy: 'parentFile' })
  managedGroups = new Collection<Group>(this);

  @OneToMany({ entity: () => GroupMember, mappedBy: 'file', orphanRemoval: true })
  groupMemberships = new Collection<GroupMember>(this);

  constructor(name: string, extension: string, fullPath: string, archivePath = '')
  {
    super();
    this.name        = name;
    this.extension   = extension;
    this.filePath    = fullPath;
    this.archivePath = archivePath;
  }

}

export interface FileStub extends BaseEntityStub
{
  name: string;
  extension: string;
  filePath: string;
  archivePath: string;
  managedGroups: GroupStub[];
  groupMemberships: GroupMemberStub[];
  mimeType?: string;
  md5?: string;
  workspaces?: WorkspaceStub[];
  tags?: TagStub[];
}
