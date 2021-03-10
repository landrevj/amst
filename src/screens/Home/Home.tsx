/* eslint-disable react/no-unused-state */ // TODO: remove
import React from 'react';
import { RouteComponentProps } from 'react-router';
import log from 'electron-log';

import DB from '../../utils/DB';
import { Workspace } from '../../entities';
import { MultiplePathPicker } from '../../components/UI/MultiplePathPicker/MultiplePathPicker';
import WorkspaceList from '../../components/Workspace/List';

import '../../App.global.scss';

interface HomeState
{
  workspaces: Workspace[];
  newName: string;
  newPaths: string[];
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
      newPaths: [''],
    };

    this.onNameChange         = this.onNameChange.bind(this);
    this.onClickAddToDB       = this.onClickAddToDB.bind(this);
    this.onClickResetDB       = this.onClickResetDB.bind(this);

    this.onPathsChange        = this.onPathsChange.bind(this);
  }

  async componentDidMount()
  {
    const workspaces = await DB.em?.find(Workspace, {});
    if (workspaces)
    {
      this.setState({
        workspaces,
      });
    }
    else log.error(`Home.tsx: Failed to load Workspaces.`);
  }

  onNameChange({ target: { value } }: React.ChangeEvent<HTMLInputElement>)
  {
    this.setState({ newName: value });
  }

  async onClickAddToDB()
  {
    const { newName } = this.state;
    const workspace = new Workspace(newName);

    DB.em?.persistAndFlush([workspace]).then(() => {

      return this.setState(prevState => ({
        workspaces: [...prevState.workspaces, workspace],
        newName: '',
        newPaths: [''],
      }));

    });
  }

  async onClickResetDB()
  {
    const { workspaces } = this.state;
    DB.em?.removeAndFlush(workspaces).then(() => {

      return this.setState({
        workspaces: [],
        newName: '',
      });

    });
  }

  onPathsChange(newPaths: string[])
  {
    this.setState({
      newPaths,
    });

    log.info(newPaths);
  }

  render()
  {
    const { workspaces, newName } = this.state;
    return (
      <>
        <h2>New workspace... {newName}</h2>
        <input type="text" value={newName} onChange={this.onNameChange}/>
        <button type="button" onClick={this.onClickAddToDB}>add</button>
        <button type="button" onClick={this.onClickResetDB}>reset</button>

        <MultiplePathPicker onChange={this.onPathsChange}/>
        <WorkspaceList workspaces={workspaces}/>
      </>
    );
  }
};
