import React from 'react';
import { RouteComponentProps } from 'react-router';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import log from 'electron-log';

import Client from '../../../shared/websocket/SocketClient';
import { WorkspaceStub } from '../../../db/entities';
import { WorkspaceForm, WorkspaceList } from '../../components/Workspace';

import { SocketRequestStatus } from '../../../shared/websocket';
import { Card, CardHeader } from '../../components/UI/Card';
import { TitlebarContext } from '../../components/Titlebar/Titlebar';

interface HomeState
{
  workspaces: WorkspaceStub[];
  loading: boolean;
}

export default class Home extends React.Component<RouteComponentProps, HomeState>
{
  static contextType = TitlebarContext;
  context!: React.ContextType<typeof TitlebarContext>;

  constructor(props: RouteComponentProps)
  {
    super(props);

    this.state = {
      workspaces: [],
      loading: true,
    };

    this.handleDeleteWorkspace = this.handleDeleteWorkspace.bind(this);
    this.handleSubmitWorkspaceForm = this.handleSubmitWorkspaceForm.bind(this);
  }

  async componentDidMount()
  {
    const { setSubtitle } = this.context;
    await setSubtitle('home');

    const response = await Client.send<WorkspaceStub[]>('Workspace', { action: 'read', params: [{}, { populate: ['folders'] }] });
    const workspaces = response.data;
    if (response.status === SocketRequestStatus.SUCCESS && workspaces)
    {
      this.setState({
        workspaces,
        loading: false,
      });
    }
    else
    {
      log.error(`Home.tsx: Failed to load Workspaces.`);
      this.setState({
        loading: false,
      });
    }
  }

  handleSubmitWorkspaceForm(newWorkspace: WorkspaceStub)
  {
    const { workspaces } = this.state;
    this.setState({
      workspaces: [...workspaces, newWorkspace],
    });
  }

  async handleDeleteWorkspace(id: number)
  {
    const { workspaces } = this.state;

    const response = await Client.send('Workspace', { action: 'destroy', params: id });
    const success = response.status === SocketRequestStatus.SUCCESS;
    if (!success) return;

    const where = workspaces.findIndex(w => w.id === id);
    workspaces.splice(where, 1);
    this.setState({ workspaces });
  }

  render()
  {
    const { workspaces, loading } = this.state;

    return (
      <div className='p-4 h-full'>
        <div className='h-full flex flex-row justify-center space-x-4'>
          <div className='flex-none w-72'>
            <Card>
              <CardHeader icon={faEdit} text='new workspace'/>
              <WorkspaceForm onSubmit={this.handleSubmitWorkspaceForm}/>
            </Card>
          </div>
          <Card empty={!loading && !workspaces.length} translucent className='flex-grow'>
            <WorkspaceList workspaces={workspaces} loading={loading} onDelete={this.handleDeleteWorkspace}/>
          </Card>
        </div>
      </div>
    );
  }
};
