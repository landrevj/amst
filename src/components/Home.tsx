import React from 'react';
import { RouteComponentProps } from 'react-router';
import log from 'electron-log';

import DB from '../utils/DB';
import User from '../entities/User';

import '../App.global.scss';

interface HomeState
{
  users: User[],
  newFirstName: string,
  newLastName: string,
}

// eslint-disable-next-line import/prefer-default-export
export class Home extends React.Component<RouteComponentProps, HomeState>
{

  constructor(props: RouteComponentProps)
  {
    super(props);

    this.state = {
      users: [],
      newFirstName: '',
      newLastName: '',
    };

    this.onFirstNameChange = this.onFirstNameChange.bind(this);
    this.onLastNameChange  = this.onLastNameChange.bind(this);
    this.onClickAddToDB    = this.onClickAddToDB.bind(this);
    this.onClickResetDB    = this.onClickResetDB.bind(this);
  }

  async componentDidMount()
  {
    const allUsers = await DB.em.find(User, {});
    if (allUsers)
    {
      this.setState({
        users: allUsers,
      });
    }
    else log.error(`Home.tsx: Failed to load Users.`);
  }

  onFirstNameChange({target: {value}})
  {
    this.setState({newFirstName: value});
  }

  onLastNameChange({target: {value}})
  {
    this.setState({newLastName: value});
  }

  async onClickAddToDB()
  {
    const { newFirstName, newLastName } = this.state;

    const user = new User();
    user.firstName = newFirstName;
    user.lastName  = newLastName;
    user.age = 25;

    await DB.em.persistAndFlush([user]);

    this.setState(prevState => ({
      users: [...prevState.users, user],
      newFirstName: '',
      newLastName: '',
    }));
  }

  async onClickResetDB()
  {
    const { users } = this.state;
    await DB.em.removeAndFlush(users);

    this.setState({
      users: [],
      newFirstName: '',
      newLastName: '',
    });
  }

  render()
  {
    const {users, newFirstName, newLastName} = this.state;
    return (
      <>
        <h2>Hello... {newFirstName} {newLastName}</h2>
        <input type="text" value={newFirstName} onChange={this.onFirstNameChange}/>
        <input type="text" value={newLastName}  onChange={this.onLastNameChange}/>
        <button type="button" onClick={this.onClickAddToDB}>add</button>
        <button type="button" onClick={this.onClickResetDB}>reset</button>
        <ul>
          {users.map((user) =>
          <li key={user.id}>
            {user.firstName} {user.lastName}
          </li>)}
        </ul>
      </>
    );
  }
};
