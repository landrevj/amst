import "reflect-metadata";
import React from 'react';
import { render } from 'react-dom';
import { createConnection } from "typeorm";
import App from './App';

import config from './ormconfig';

// eslint-disable-next-line promise/always-return
createConnection(config).then(async () => {
  console.log('gotConnection');
  render(<App />, document.getElementById('root'));

}).catch((error) => {
  console.log('connection error');
  console.log(error)
});
