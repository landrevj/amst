import React from 'react';
import { RouteComponentProps } from 'react-router';
import log from 'electron-log';

import Client from '../../../utils/websocket/SocketClient';
import { WorkspaceStub } from '../../../db/entities';
import { WorkspaceForm, WorkspaceList } from '../../components/Workspace';

import '../../../App.global.scss';
import { SocketRequestStatus } from '../../../utils/websocket';

interface HomeState
{
  workspaces: WorkspaceStub[];
}

// eslint-disable-next-line import/prefer-default-export
export class Home extends React.Component<RouteComponentProps, HomeState>
{

  constructor(props: RouteComponentProps)
  {
    super(props);

    this.state = {
      workspaces: [],
    };

    this.onClickResetDB        = this.onClickResetDB.bind(this);
    this.onSubmitWorkspaceForm = this.onSubmitWorkspaceForm.bind(this);
  }

  async componentDidMount()
  {
    const response = await Client.send<WorkspaceStub[]>('Workspace', { action: 'getWorkspaces', params: [{}, ['folders']] });
    const workspaces = response.data;
    if (response.status === SocketRequestStatus.SUCCESS && workspaces)
    {
      this.setState({
        workspaces,
      });
    }
    else log.error(`Home.tsx: Failed to load Workspaces.`);
  }

  // eslint-disable-next-line class-methods-use-this
  async onClickResetDB()
  {
    const { workspaces } = this.state;
    const workspaceIDs = workspaces.map(workspace => workspace.id);

    const response = await Client.send('Workspace', { action: 'removeWorkspaces', params: workspaceIDs });
    const removed = response.status === SocketRequestStatus.SUCCESS;
    if (removed) this.setState({
      workspaces: [],
    });
  }

  onSubmitWorkspaceForm(newWorkspace: WorkspaceStub)
  {
    const { workspaces } = this.state;
    this.setState({
      workspaces: [...workspaces, newWorkspace],
    });
  }

  render()
  {
    const { workspaces } = this.state;
    return (
      <>
        <button type="button" onClick={this.onClickResetDB}>reset</button>
        <WorkspaceForm onSubmit={this.onSubmitWorkspaceForm}/>
        <hr/>
        <WorkspaceList workspaces={workspaces}/>
      </>
    );
  }
};
