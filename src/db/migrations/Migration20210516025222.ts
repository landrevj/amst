/* eslint-disable import/prefer-default-export */
import { Migration } from '@mikro-orm/migrations';

export class Migration20210516025222 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `group` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `name` varchar not null);');

    this.addSql('create table `group_member` (`group_id` integer not null, `file_id` integer not null, `position` integer not null, primary key (`group_id`, `file_id`));');
    this.addSql('create index `group_member_group_id_index` on `group_member` (`group_id`);');
    this.addSql('create index `group_member_file_id_index` on `group_member` (`file_id`);');

    this.addSql('alter table `workspace` add column `group_archive_contents` integer null;');

    this.addSql('alter table `group` add column `parent_file_id` integer null;');
    this.addSql('create index `group_parent_file_id_index` on `group` (`parent_file_id`);');

    // this.addSql('alter table `group_member` add column `group_id` integer null;');
    // this.addSql('alter table `group_member` add column `file_id` integer null;');
    // this.addSql('create index `group_member_group_id_index` on `group_member` (`group_id`);');
    // this.addSql('create index `group_member_file_id_index` on `group_member` (`file_id`);');

    this.addSql('create unique index `group_member_group_id_position_unique` on `group_member` (`group_id`, `position`);');
  }

}
