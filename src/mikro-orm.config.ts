import { Options } from '@mikro-orm/core';
import { join } from 'path';
import User from './entities/User';

const options: Options = {
  type: 'sqlite',
  dbName: join(__dirname, 'database.sqlite'),
  entities: [User],
  discovery: { disableDynamicFileAccess: true },
  migrations: {
    tableName: 'mikro_orm_migrations', // name of database table with log of executed transactions
    path: join(__dirname, 'migrations'), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.ts$/, // regex pattern for the migration files
    transactional: true, // wrap each migration in a transaction
    disableForeignKeys: true, // wrap statements with `set foreign_key_checks = 0` or equivalent
    allOrNothing: true, // wrap all migrations in master transaction
    dropTables: false, // allow to disable table dropping
    safe: true, // allow to disable table and column dropping
    emit: 'ts', // migration generation mode
  }
};

export default options;
