/* eslint-disable import/prefer-default-export */
import { Migration } from '@mikro-orm/migrations';

export class Migration20210514060552 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `file` rename column `full_path` to `file_path`;');


    this.addSql('alter table `file` add column `archive_path` varchar null;');

    this.addSql('alter table `workspace` add column `search_archives` integer null;');

    this.addSql('drop index `file_full_path_unique`;');

    this.addSql('create unique index `file_file_path_archive_path_unique` on `file` (`file_path`, `archive_path`);');
  }

}
