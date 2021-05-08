import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faSyncAlt } from '@fortawesome/free-solid-svg-icons';

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
  status: [number, number] | string;
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

    this.handleClickSync = this.handleClickSync.bind(this);
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

  async handleClickSync()
  {
    const { workspace } = this.props;

    const response: SocketResponse<string> = await Client.send('Workspace', { action: 'syncFiles', params: workspace.id });
    const failure  = response.status === SocketRequestStatus.FAILURE;

    if (failure) this.setState({ status: 'Sync failed!' });
  }

  async syncStatusListener(response: SocketResponse<[number, number]>)
  {
    console.log('recieved', Date.now());
    const { status, data } = response;

    const searchState  = status === SocketRequestStatus.RUNNING ? SpinnerState.WORKING : SpinnerState.IDLE;
    const statusArray = data || '';

    this.setState({
      searchState,
      status: statusArray,
    });
  }

  render()
  {
    const { workspace } = this.props;
    const { folders, searchState, status } = this.state;

    let statusDiv = <span>{status}</span>;
    if (typeof status !== 'string')
    {
      const [totalDiscovered, totalAdded] = status;
      statusDiv = (
        <div className='flex flex-row text-base space-x-4 mr-4'>
          <div className='flex justify-center'>
            <div className='my-auto'>
              <FontAwesomeIcon className='mr-1' icon={faSearch}/>
              <span>{totalDiscovered.toLocaleString()}</span>
            </div>
          </div>
          <div className='flex justify-center'>
            <div className='my-auto'>
              <FontAwesomeIcon className='mr-1' icon={faPlus}/>
              <span>{totalAdded.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`relative p-4 rounded
        animate-bg-gradient-shift-fast bg-gradient-to-r from-indigo-600 via-blue-400 to-indigo-600 filter saturate-[0.7] ${searchState === SpinnerState.WORKING ? '' : 'animation-paused'}`}>
        <div className='flex flex-col space-y-4'>
          <div className='relative flex flex-row text-xl text-gray-100'>

            <Link to={`/file?workspaceID=${workspace.id}`}>{workspace.name}</Link>
            <div className='flex-grow'/>
            {statusDiv}
            {searchState === SpinnerState.WORKING ?
            <div>
              <div className='inline-block float-right relative'>
                <div className='spinner'/>
              </div>
            </div>
            :
            <button type='button' className='float-right text-white' onClick={this.handleClickSync}>
              <FontAwesomeIcon icon={faSyncAlt}/>
            </button>
            }

          </div>

          <div className='z-0 p-4 bg-gray-100 rounded'>
            <FolderList folders={folders}/>
          </div>
        </div>

      </div>
    );
  }

}
