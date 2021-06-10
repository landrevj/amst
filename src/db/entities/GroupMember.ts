import { Entity, Property, ManyToOne, PrimaryKeyType } from '@mikro-orm/core'

// eslint-disable-next-line import/no-cycle
import { Group, GroupStub, File, FileStub } from './index';


@Entity()
export class GroupMember
{
  @ManyToOne(() => Group, { primary: true })
  group!: Group;

  @ManyToOne(() => File, { primary: true })
  file!: File;

  @Property({ type: 'number' })
  position!: number;

  [PrimaryKeyType]: [number, number];

  constructor(group: Group, file: File, position?: number)
  {
    this.group = group;
    this.file = file;
    this.position = position || group.members.count();
  }
}

export interface GroupMemberStub
{
  group: GroupStub;
  file: FileStub;
  position: number;
}
