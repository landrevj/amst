/* eslint-disable import/prefer-default-export */
import { Migration } from '@mikro-orm/migrations';

export class Migration20210517162640 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `tag` add column `group_id` integer null;');
    this.addSql('create index `tag_group_id_index` on `tag` (`group_id`);');

    this.addSql('drop index `tag_name_category_file_id_unique`;');

    this.addSql('create unique index `tag_name_category_file_id_group_id_unique` on `tag` (`name`, `category`, `file_id`, `group_id`);');
  }

}
