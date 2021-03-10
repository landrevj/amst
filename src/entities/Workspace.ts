/* eslint-disable import/prefer-default-export */
import { Entity, ManyToMany, PrimaryKey, Property, Collection } from '@mikro-orm/core'

// eslint-disable-next-line import/no-cycle
import { File } from './File';

@Entity()
export class Workspace
{

  @PrimaryKey({ type: 'number' })
  id!: number;

  @Property({ type: 'string' })
  name!: string;

  @ManyToMany(() => File, 'workspaces', { owner: true })
  files = new Collection<File>(this);

  constructor(name: string)
  {
    this.name = name;
  }

}
