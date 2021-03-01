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

createConnection(connectionOptions)
// eslint-disable-next-line promise/always-return
  .then(async connection => {
    console.log("Inserting a new user into the database...");
    const user = new User();
    user.firstName = "Timber";
    user.lastName = "Saw";
    user.age = 25;
    await connection.manager.save(user);
    console.log(`Saved a new user with id: ${user.id}`);

    console.log("Loading users from the database...");
    const users = await connection.manager.find(User);
    console.log("Loaded users: ", users);

    console.log("Here you can setup and run express/koa/any other framework.");

    render(<App />, document.getElementById('root'));
}).catch(error => console.log(error));
