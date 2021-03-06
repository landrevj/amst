import { Migration } from '@mikro-orm/migrations';

// eslint-disable-next-line import/prefer-default-export
export class Migration20210306010806 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `user` (`id` integer not null primary key autoincrement, `first_name` varchar not null, `last_name` varchar not null, `age` integer not null);');
  }

}
