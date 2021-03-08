/* eslint-disable import/prefer-default-export */
import { Migration } from '@mikro-orm/migrations';

export class Migration20210307045325 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `workspace` (`id` integer not null primary key autoincrement, `name` varchar not null);');
  }

}
