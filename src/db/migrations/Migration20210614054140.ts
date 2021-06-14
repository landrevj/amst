/* eslint-disable import/prefer-default-export */
import { Migration } from '@mikro-orm/migrations';

export class Migration20210614054140 extends Migration {

  async up(): Promise<void> {
    this.addSql('drop index `tag_name_category_file_id_group_id_unique`;');

    this.addSql('create unique index `tag_name_category_group_id_unique` on `tag` (`name`, `category`, `group_id`);');

    this.addSql('create unique index `tag_name_category_file_id_unique` on `tag` (`name`, `category`, `file_id`);');
  }

}
