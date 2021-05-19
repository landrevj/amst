import { Entity, OneToMany, Property, Collection, ManyToOne } from '@mikro-orm/core'

// eslint-disable-next-line import/no-cycle
import { GroupMember, GroupMemberStub, File, FileStub, Tag, TagStub } from './index';
import { BaseEntity, BaseEntityStub } from './BaseEntity';


@Entity()
export class Group extends BaseEntity
{
  @Property({ type: 'string' })
  name!: string;

  @OneToMany({ entity: () => Tag, mappedBy: 'group', orphanRemoval: true })
  tags = new Collection<Tag>(this);

  @ManyToOne(() => File, { nullable: true })
  parentFile?: File;

  @OneToMany({ entity: () => GroupMember, mappedBy: 'group', orphanRemoval: true })
  members = new Collection<GroupMember>(this);

  constructor(name: string, parentFile?: File)
  {
    super();
    this.name = name;
    this.parentFile = parentFile;
  }
}

export interface GroupStub extends BaseEntityStub
{
  name: string
  tags?: TagStub[];
  parentFile: FileStub;
  members: GroupMemberStub[];
}
