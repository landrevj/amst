/* eslint-disable import/prefer-default-export */
import { Migration } from '@mikro-orm/migrations';

export class Migration20210309053929 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `file` (`id` integer not null primary key autoincrement, `name` varchar not null, `extension` varchar not null, `full_path` varchar not null);');

    this.addSql('create table `workspace_files` (`workspace_id` integer not null, `file_id` integer not null, primary key (`workspace_id`, `file_id`));');
    this.addSql('create index `workspace_files_workspace_id_index` on `workspace_files` (`workspace_id`);');
    this.addSql('create index `workspace_files_file_id_index` on `workspace_files` (`file_id`);');
  }

}
