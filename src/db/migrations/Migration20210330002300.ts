/* eslint-disable import/prefer-default-export */
import { Migration } from '@mikro-orm/migrations';

export class Migration20210330002300 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `file` add column `mime_type` varchar null;');
    this.addSql('alter table `file` add column `md5` varchar null;');
  }

}
