/* eslint-disable prefer-destructuring */
import { ipcRenderer } from 'electron';
import { Options } from '@mikro-orm/core';
import { join, basename } from 'path';
import User from './entities/User';

const isDev  = process.env.NODE_ENV === 'development';
const dbPath = isDev ?
               join(__dirname, 'dev_database.sqlite') :
               join(ipcRenderer.sendSync('get-app-path', 'userData'), 'database.sqlite');


// ///////////////////////////////////////////
// static importing all migrations for webpack
const migrations = {};

function importAll(r: __WebpackModuleApi.RequireContext)
{
  // eslint-disable-next-line no-return-assign
  r.keys().forEach((key) => (migrations[basename(key)] = Object.values(r(key))[0]));
}

importAll(require.context('./migrations', false, /\.ts$/));

const migrationsList = Object.keys(migrations).map((migrationName) => ({
  name: migrationName,
  class: migrations[migrationName],
}));
// ///////////////////////////////////////////

const options: Options = {
  type: 'sqlite',
  dbName: dbPath,
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
    migrationsList,
  }
};

export default options;
