import React from 'react';
import { RouteComponentProps } from 'react-router';
import log from 'electron-log';

import Client from '../../../utils/websocket/SocketClient';
import { WorkspaceStub } from '../../../db/entities';
import { WorkspaceForm, WorkspaceList } from '../../components/Workspace';

import { SocketRequestStatus } from '../../../utils/websocket';
import '../../App.global.css';

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
      <>
      <div className='h-screen animate-bg-gradient-shift bg-gradient-to-tr from-indigo-800 via-blue-500 to-teal-500 filter saturate-[0.7]'/>
        {/* <button className='fixed top-0 right-0 bg-red-300' type="button" onClick={this.onClickResetDB}>reset</button> */}
      <div className='h-screen absolute inset-0 p-4 bg-transparent'>
        <div className='h-full flex flex-row justify-center space-x-4 px-4'>
          <div className='max-h-full'>
            <div className='max-h-full overflow-auto bg-white rounded'>
              <WorkspaceForm onSubmit={this.onSubmitWorkspaceForm}/>
            </div>
          </div>
          <div className='overflow-auto flex-grow max-w-5xl space-y-2 bg-white p-4 rounded'>
            <WorkspaceList workspaces={workspaces}/>
          </div>
        </div>
      </div>
      </>
    );
  }
};
