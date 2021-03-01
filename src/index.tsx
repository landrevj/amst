import "reflect-metadata";
import React from 'react';
import { render } from 'react-dom';
import {createConnection, ConnectionOptions} from "typeorm";
import App from './App';
import User from "./entity/User";

const connectionOptions: ConnectionOptions = {
  type: "sqlite",
  synchronize: true,
  database: "src/database.sqlite",
  entities: [User],
};

// eslint-disable-next-line promise/always-return
createConnection(connectionOptions).then(() => {

  render(<App />, document.getElementById('root'));

}).catch(() => {
  // console.log(error)
});
