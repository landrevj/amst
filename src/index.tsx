import 'reflect-metadata';

import React from 'react';
import { render } from 'react-dom';
import log from 'electron-log';
import App from './App';
import DB from './utils/DB';

// eslint-disable-next-line promise/always-return
DB.init().then(() => {
  render(<App />, document.getElementById('root'));
}).catch(log.catchErrors);
