import React from 'react';
import { RouteComponentProps } from 'react-router';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import log from 'electron-log';

import Client from '../../../utils/websocket/SocketClient';
import { WorkspaceStub } from '../../../db/entities';
import { WorkspaceForm, WorkspaceList } from '../../components/Workspace';

import { SocketRequestStatus } from '../../../utils/websocket';
import '../../App.global.css';
import { Card } from '../../components/UI/Card';

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
    const response = await Client.send<WorkspaceStub[]>('Workspace', { action: 'read', params: [{}, { populate: ['folders'] }] });
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

    const response = await Client.send('Workspace', { action: 'destroy', params: workspaceIDs });
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
      <div className='p-4 h-full'>
        <div className='h-full flex flex-row justify-center space-x-4'>
          <div className='flex-none w-72'>
            <Card icon={faEdit} text='new workspace'>
              <WorkspaceForm onSubmit={this.onSubmitWorkspaceForm}/>
            </Card>
          </div>
          <Card empty={!workspaces.length} className='flex-grow p-4'>
            <WorkspaceList workspaces={workspaces}/>
          </Card>
        </div>
      </div>
    );
  }
};
