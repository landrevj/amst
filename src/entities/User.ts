import {Entity, PrimaryKey, Property} from '@mikro-orm/core'

@Entity()
export default class User {

    @PrimaryKey({ type: 'number' })
    id!: number;

    @Property({ type: 'string' })
    firstName: string;

    @Property({ type: 'string' })
    lastName: string;

    @Property({ type: 'number' })
    age: number;

}
