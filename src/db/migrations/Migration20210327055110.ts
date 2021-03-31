/* eslint-disable import/prefer-default-export */
import { Migration } from '@mikro-orm/migrations';

export class Migration20210327055110 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `tag` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `name` varchar not null, `category` varchar null);');

    this.addSql('alter table `tag` add column `file_id` integer null;');
    this.addSql('create index `tag_file_id_index` on `tag` (`file_id`);');

    this.addSql('create unique index `tag_name_category_file_id_unique` on `tag` (`name`, `category`, `file_id`);');
  }

}
