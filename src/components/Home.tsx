import React from 'react';
import { Connection, getConnection, getRepository } from 'typeorm';
import { RouteComponentProps } from 'react-router';
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
  private connection: Connection;

  constructor(props: RouteComponentProps)
  {
    super(props);

    this.connection = getConnection();

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
    const allUsers = await getRepository(User).find();
    if (allUsers)
    {
      this.setState({
        users: allUsers,
      });
    }
    // else console.log("Home.tsx: Failed to load User repository.");
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


    await this.connection.manager.save(user);

    this.setState(prevState => ({
      users: [...prevState.users, user],
      newFirstName: '',
      newLastName: '',
    }));
  }

  async onClickResetDB()
  {
    const repo = await getRepository(User);
    const { users } = this.state;
    repo.remove(users);

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
        <input type="text" value={newLastName} onChange={this.onLastNameChange}/>
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
