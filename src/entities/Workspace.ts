import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity()
export default class Workspace {

  @PrimaryKey({ type: 'number' })
  id!: number;

  @Property({ type: 'string' })
  name!: string;

  constructor(name: string)
  {
    this.name = name;
  }

}
