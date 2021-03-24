/* eslint-disable import/prefer-default-export */
import { Migration } from '@mikro-orm/migrations';

export class Migration20210324085401 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `file` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `name` varchar not null, `extension` varchar not null, `full_path` varchar not null);');
    this.addSql('create unique index `file_full_path_unique` on `file` (`full_path`);');

    this.addSql('create table `workspace` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `name` varchar not null);');
    this.addSql('create unique index `workspace_name_unique` on `workspace` (`name`);');

    this.addSql('create table `folder` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `path` varchar not null);');

    this.addSql('create table `workspace_files` (`workspace_id` integer not null, `file_id` integer not null, primary key (`workspace_id`, `file_id`));');
    this.addSql('create index `workspace_files_workspace_id_index` on `workspace_files` (`workspace_id`);');
    this.addSql('create index `workspace_files_file_id_index` on `workspace_files` (`file_id`);');

    this.addSql('alter table `folder` add column `workspace_id` integer null;');
    this.addSql('create index `folder_workspace_id_index` on `folder` (`workspace_id`);');
  }

}
