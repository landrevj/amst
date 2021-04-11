/* eslint-disable import/prefer-default-export */
import { Migration } from '@mikro-orm/migrations';

export class Migration20210411044519 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `file` add column `mime_type` varchar null;');
    this.addSql('alter table `file` add column `md5` varchar null;');

    this.addSql('create table `tag` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `name` varchar not null, `category` varchar not null);');

    this.addSql('alter table `tag` add column `file_id` integer null;');
    this.addSql('create index `tag_file_id_index` on `tag` (`file_id`);');

    this.addSql('create unique index `tag_name_category_file_id_unique` on `tag` (`name`, `category`, `file_id`);');
  }

}
