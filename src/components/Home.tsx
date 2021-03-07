import React from 'react';
import { RouteComponentProps } from 'react-router';
import log from 'electron-log';

import DB from '../utils/DB';
import Workspace from '../entities/Workspace';

import '../App.global.scss';

interface HomeState
{
  workspaces: Workspace[],
  newName: string,
}

// eslint-disable-next-line import/prefer-default-export
export class Home extends React.Component<RouteComponentProps, HomeState>
{

  constructor(props: RouteComponentProps)
  {
    super(props);

    this.state = {
      workspaces: [],
      newName: '',
    };

    this.onNameChange   = this.onNameChange.bind(this);
    this.onClickAddToDB = this.onClickAddToDB.bind(this);
    this.onClickResetDB = this.onClickResetDB.bind(this);
  }

  async componentDidMount()
  {
    const allWorkspaces = await DB.em.find(Workspace, {});
    if (allWorkspaces)
    {
      this.setState({
        workspaces: allWorkspaces,
      });
    }
    else log.error(`Home.tsx: Failed to load Workspaces.`);
  }

  onNameChange({target: {value}})
  {
    this.setState({newName: value});
  }

  async onClickAddToDB()
  {
    const { newName } = this.state;

    const workspace = new Workspace(newName);

    await DB.em.persistAndFlush([workspace]);

    this.setState(prevState => ({
      workspaces: [...prevState.workspaces, workspace],
      newName: '',
    }));
  }

  async onClickResetDB()
  {
    const { workspaces } = this.state;
    await DB.em.removeAndFlush(workspaces);

    this.setState({
      workspaces: [],
      newName: '',
    });
  }

  render()
  {
    const {workspaces, newName} = this.state;
    return (
      <>
        <h2>New workspace... {newName}</h2>
        <input type="text" value={newName} onChange={this.onNameChange}/>
        <button type="button" onClick={this.onClickAddToDB}>add</button>
        <button type="button" onClick={this.onClickResetDB}>reset</button>
        <ul>
          {workspaces.map((workspace) =>
          <li key={workspace.id}>
            {workspace.name}
          </li>)}
        </ul>
      </>
    );
  }
};
