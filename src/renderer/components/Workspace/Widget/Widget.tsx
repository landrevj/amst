import React from 'react';
import { Link } from 'react-router-dom';

import Client from '../../../../utils/websocket/SocketClient';
import { FolderStub, WorkspaceStub } from '../../../../db/entities';
import { isNumberArray } from '../../../../utils';
import FolderList from '../../Folder/List';
import { SocketResponse, SocketRequestStatus } from '../../../../utils/websocket';

interface WorkspaceWidgetProps
{
  workspace: WorkspaceStub;
}

enum SpinnerState
{
  IDLE = 'IDLE',
  WORKING = 'WORKING',
}

interface WorkspaceWidgetState
{
  folders: FolderStub[];
  searchState: SpinnerState;
  status: string;
}

export default class WorkspaceWidget extends React.Component<WorkspaceWidgetProps, WorkspaceWidgetState>
{

  constructor(props: WorkspaceWidgetProps)
  {
    super(props);

    const { workspace } = this.props;

    // if workspace.folders was initalized when passed in, set it as the initial state
    let folders: FolderStub[] = [];
    if (!isNumberArray(workspace.folders) && workspace.folders?.length)
      folders = workspace.folders;

    this.state = {
      folders,
      searchState: SpinnerState.IDLE,
      status: '',
    };

    this.onClickSync = this.onClickSync.bind(this);
    this.syncStatusListener = this.syncStatusListener.bind(this);
  }

  componentDidMount()
  {
    const { workspace } = this.props;

    Client.socket?.on(`Workspace_${workspace.id}_sync`, this.syncStatusListener);
  }

  componentWillUnmount()
  {
    const { workspace } = this.props;

    Client.socket?.off(`Workspace_${workspace.id}_sync`, this.syncStatusListener);
  }

  async onClickSync()
  {
    const { workspace } = this.props;

    const response: SocketResponse<string> = await Client.send('Workspace', { action: 'syncFiles', params: workspace.id });
    const failure  = response.status === SocketRequestStatus.FAILURE;

    if (failure) this.setState({ status: 'Sync failed!' });
  }

  async syncStatusListener(response: SocketResponse<string>)
  {
    const { status, data } = response;

    const searchState  = status === SocketRequestStatus.RUNNING ? SpinnerState.WORKING : SpinnerState.IDLE;
    const statusString = data || '';

    this.setState({
      searchState,
      status: statusString,
    });
  }

  render()
  {
    const { workspace } = this.props;
    const { folders, searchState, status }   = this.state;

    return (
      <div>
        <Link to={`/workspace/${workspace.id}?page=0`}>{workspace.name}</Link>
        <button type='button' onClick={this.onClickSync}>sync</button> - {searchState}{status.length ? ` - ${status}` : ''}
        <FolderList folders={folders}/>
      </div>
    );
  }

}
