/* eslint-disable react/no-unused-state */ // TODO: remove after state is used
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
  Idle = 'IDLE',
  Working = 'WORKING',
}

interface WorkspaceWidgetState
{
  folders: FolderStub[];
  searchState: SpinnerState;
  lastFile: string;
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
      searchState: SpinnerState.Idle,
      lastFile: '',
      status: '',
    };

    this.onClickSync = this.onClickSync.bind(this);
  }

  async onClickSync()
  {
    const { workspace } = this.props;
    this.setState({ searchState: SpinnerState.Working, status: 'Looking for new files...' });

    const response: SocketResponse<string> = await Client.send('Workspace', { action: 'syncFiles', params: workspace.id });
    const success  = response.status === SocketRequestStatus.SUCCESS;

    if (success) this.setState({ searchState: SpinnerState.Idle, status: response.data as string });
    else         this.setState({ searchState: SpinnerState.Idle, status: 'Sync failed!' });
  }

  render()
  {
    const { workspace } = this.props;
    const { folders, searchState, status }   = this.state;

    return (
      <div>
        <Link to={`/workspace/${workspace.id}`}>{workspace.name}</Link>
        <button type='button' onClick={this.onClickSync}>sync</button> - {searchState}{status.length ? ` - ${status}` : ''}
        <FolderList folders={folders}/>
      </div>
    );
  }

}
