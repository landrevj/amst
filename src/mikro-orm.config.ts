/* eslint-disable prefer-destructuring */
import { Constructor, Options } from '@mikro-orm/core';
import { Migration } from '@mikro-orm/migrations';
import { join, basename } from 'path';

import { Workspace, File } from './entities';

// ///////////////////////////////////////////
// static importing all migrations for webpack
interface Migrations
{
  [key: string]: Constructor<Migration>;
}

const migrations: Migrations = {};

function importAll(r: __WebpackModuleApi.RequireContext)
{
  r.keys().forEach((key) => {
    migrations[basename(key)] = Object.values(r(key))[0] as Constructor<Migration>;
  });
}

if (process.env.NODE_ENV) importAll(require.context('./migrations', false, /\.ts$/));

const migrationsList = Object.keys(migrations).map((migrationName) => ({
  name: migrationName,
  class: migrations[migrationName],
}));
// ///////////////////////////////////////////

const options: Options = {
  type: 'sqlite',
  dbName: join(__dirname, 'dev_database.sqlite'),
  entities: [Workspace, File], // order can matter here: https://mikro-orm.io/docs/installation#possible-issues-with-circular-dependencies
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
    migrationsList,
  }
};

export default options;
