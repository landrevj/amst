/* eslint-disable import/prefer-default-export */
import { Migration } from '@mikro-orm/migrations';

export class Migration20210610060407 extends Migration {

  async up(): Promise<void> {
    this.addSql('drop index `group_member_group_id_position_unique`;');
  }

}
