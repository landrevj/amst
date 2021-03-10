import 'reflect-metadata';

import React from 'react';
import { render } from 'react-dom';
import log from 'electron-log';

import App from './App';
import DB from './utils/DB';

// set logging level based on NODE_ENV.
if (process.env.NODE_ENV === 'development')
{
  log.transports.console.level = 'debug'; // this doesnt seem to do anything which is neat
  log.info(`index.tsx: Console logging transport set to: ${log.transports.console.level}`)
}

// init the database before mounting the application
DB.init()
  .then(() => {

    log.debug('index.tsx: Will run migrations up through current...');
    return DB.orm?.getMigrator().up(); // promise hurts me monke brain.

  }).then((migration) => {

    if (!migration)
    {
      log.error('index.tsx: Failed to run migrations!');
      throw new Error();
    }

    log.debug('index.tsx: Migrations were successful.');
    return render(<App />, document.getElementById('root'));

  }).catch(log.catchErrors);
