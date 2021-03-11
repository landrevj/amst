/* eslint-disable import/prefer-default-export */
import { Migration } from '@mikro-orm/migrations';

export class Migration20210311014939 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `folder` (`id` integer not null primary key autoincrement, `path` varchar not null);');
    this.addSql('create unique index `folder_path_unique` on `folder` (`path`);');

    this.addSql('create table `file` (`id` integer not null primary key autoincrement, `name` varchar not null, `extension` varchar not null, `full_path` varchar not null);');
    this.addSql('create unique index `file_full_path_unique` on `file` (`full_path`);');

    this.addSql('create table `workspace` (`id` integer not null primary key autoincrement, `name` varchar not null);');
    this.addSql('create unique index `workspace_name_unique` on `workspace` (`name`);');

    this.addSql('create table `workspace_files` (`workspace_id` integer not null, `file_id` integer not null, primary key (`workspace_id`, `file_id`));');
    this.addSql('create index `workspace_files_workspace_id_index` on `workspace_files` (`workspace_id`);');
    this.addSql('create index `workspace_files_file_id_index` on `workspace_files` (`file_id`);');

    this.addSql('create table `workspace_folders` (`workspace_id` integer not null, `folder_id` integer not null, primary key (`workspace_id`, `folder_id`));');
    this.addSql('create index `workspace_folders_workspace_id_index` on `workspace_folders` (`workspace_id`);');
    this.addSql('create index `workspace_folders_folder_id_index` on `workspace_folders` (`folder_id`);');
  }

}
