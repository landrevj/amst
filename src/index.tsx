import 'reflect-metadata';

import React from 'react';
import { render } from 'react-dom';
import log from 'electron-log';
import App from './App';
import DB from './utils/DB';

DB.init()
  .then(() => {

    log.debug('index.tsx: Will run migrations up through current...');
    return DB.orm?.getMigrator().up(); // promise hurts me monke brain.

  }).then(() => {

    log.debug('index.tsx: Migrations were successful.');
    return render(<App />, document.getElementById('root'));

  }).catch(log.catchErrors);
