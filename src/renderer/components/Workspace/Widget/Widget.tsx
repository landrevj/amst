import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faCheck, faDatabase, faExclamationTriangle, faFolder, faPlus, faSearch, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { faCopy, faTrashAlt } from '@fortawesome/free-regular-svg-icons';

import Client from '../../../../utils/websocket/SocketClient';
import { FolderStub, WorkspaceStub } from '../../../../db/entities';
import { isNumberArray } from '../../../../utils';
import FolderList from '../../Folder/List';
import { SocketResponse, SocketRequestStatus } from '../../../../utils/websocket';
import { Card, CardFooter, CardHeader, CardModal, CardSection } from '../../UI/Card';
import ExtensionPercentagesGraph, { ExtensionPercentagesGraphData } from '../../UI/Graphs/ExtensionPercentages';

interface WorkspaceWidgetProps
{
  workspace: WorkspaceStub;
  onDelete?: (id: number) => void;
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
  fileCount?: number,
  fileExtensionData?: ExtensionPercentagesGraphData;
  deleteModalOpen: boolean;
  loadingFileStats: boolean;
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
      deleteModalOpen: false,
      loadingFileStats: false,
    };

    this.handleClickSync = this.handleClickSync.bind(this);
    this.syncStatusListener = this.syncStatusListener.bind(this);
    this.handleOpenDeleteModal = this.handleOpenDeleteModal.bind(this);
    this.handleCloseDeleteModal = this.handleCloseDeleteModal.bind(this);
  }

  componentDidMount()
  {
    const { workspace } = this.props;

    this.loadFileStats();

    Client.socket?.on(`Workspace_${workspace.id}_sync`, this.syncStatusListener);
  }

  componentDidUpdate(_prevProps: WorkspaceWidgetProps, prevState: WorkspaceWidgetState)
  {
    const { searchState } = this.state;
    if (prevState.searchState === SpinnerState.WORKING && searchState === SpinnerState.IDLE)
    {
      this.loadFileStats();
    }
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

  handleOpenDeleteModal() { this.setState({ deleteModalOpen: true }); }
  handleCloseDeleteModal() { this.setState({ deleteModalOpen: false }); }

  async loadFileStats()
  {
    this.setState({ loadingFileStats: true });
    const { workspace: { id } } = this.props;
    const response = await Client.send<[number, ExtensionPercentagesGraphData]>('Workspace', { action: 'file-stats', params: id });
    if (response.status === SocketRequestStatus.FAILURE || !response.data)
    {
      this.setState({ loadingFileStats: false });
      return;
    }

    const [count, data] = response.data;

    this.setState({
      fileCount: count,
      fileExtensionData: data,
      loadingFileStats: false,
    })
  }

  async syncStatusListener(response: SocketResponse<[number, number]>)
  {
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
    const { workspace, onDelete } = this.props;
    const { folders, searchState, status, fileCount, fileExtensionData, deleteModalOpen, loadingFileStats } = this.state;

    let statusDiv = (
      <div className='flex flex-row text-base text-gray-500 space-x-4'>
        <div className='flex justify-center'>
          <div className='my-auto'>
            <FontAwesomeIcon className='mr-1' icon={faCopy}/>
            <span>{(fileCount || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    );

    if (typeof status !== 'string')
    {
      const [totalDiscovered, totalAdded] = status;
      statusDiv = (
        <div className='flex flex-row text-base text-gray-500 space-x-4'>
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
      <Card className='relative'>

        <div className='relative flex flex-row text-xl'>

          <Link to={`/file?workspaceID=${workspace.id}`}>{workspace.name}</Link>
          <div className='flex-grow'/>
          {statusDiv}
          {searchState === SpinnerState.WORKING ?
          <div className='ml-4'>
            <div className='inline-block float-right relative'>
              <div className='spinner'/>
            </div>
          </div>
          : null
          }

        </div>

        <CardSection fullWidth className='flex flex-col gap-4 p-4 pb-0'>
          <CardSection headerIcon={faFolder} className='bg-gray-100'>
            <FolderList folders={folders}/>
          </CardSection>

          <CardSection headerIcon={faDatabase} className='bg-gray-100'>
            <div className='mt-2'>
              <ExtensionPercentagesGraph loading={loadingFileStats} data={fileExtensionData}/>
            </div>
          </CardSection>
        </CardSection>

        <div className='flex-grow'/>

        <CardFooter buttons>
          <button type="button" className='hover:text-red-400 disabled:text-gray-200' onClick={this.handleOpenDeleteModal} disabled={searchState === SpinnerState.WORKING}>
            <FontAwesomeIcon icon={faTrashAlt}/>
          </button>
          <button type='button' className='hover:text-blue-400 disabled:text-gray-200' onClick={this.handleClickSync} disabled={searchState === SpinnerState.WORKING}>
            <FontAwesomeIcon icon={faSyncAlt}/>
          </button>
        </CardFooter>

        <CardModal
          isOpen={deleteModalOpen}
          onRequestClose={this.handleCloseDeleteModal}
        >
          <CardHeader className='text-red-500' icon={faExclamationTriangle} text={`delete ${workspace.name}`}/>

          <CardSection fullWidth>
            <p>This will only remove the workspace.</p>
            <p>No files or their tags will be removed from the database.</p>
            <br/>
            <p className='text-red-500'>Are you sure you want to delete this workspace?</p>
          </CardSection>

          <CardFooter buttons>
            <button type="button" className='hover:text-red-400' onClick={this.handleCloseDeleteModal}>
              <FontAwesomeIcon icon={faBan}/>
            </button>
            <button type="button" className='hover:text-green-400' onClick={() => onDelete && onDelete(workspace.id) }>
              <FontAwesomeIcon icon={faCheck}/>
            </button>
          </CardFooter>

        </CardModal>

      </Card>
    );
  }

}
