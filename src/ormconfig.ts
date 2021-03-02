import { ConnectionOptions } from 'typeorm';
import { join } from 'path';
import User from './entities/User'


const config: ConnectionOptions = {
  type:            'sqlite',
  database:        './src/database.sqlite',
  synchronize:      process.env.NODE_ENV === 'development',
  logging:          false,
  migrationsRun:    true,
  entities:         [User],
  // entities:         [join(__dirname, '/entities/**/*{.ts,.js}')],
  migrations:       [join(__dirname, '/migrations/*{.ts,.js}')],
  cli: {
    entitiesDir:    'entities',
    migrationsDir:  'migrations',
    subscribersDir: 'subscribers',
  },
};

export default config;
