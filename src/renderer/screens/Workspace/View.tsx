import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { FilterQuery, FindOptions } from '@mikro-orm/core';
import log from 'electron-log';


import Client from '../../../utils/websocket/SocketClient';
import { WorkspaceStub, FileStub, File } from '../../../db/entities';
import FileList from '../../components/File/List';

import { SocketRequestStatus } from '../../../utils/websocket';
import '../../../App.global.scss';

interface WorkspaceViewRouteParams
{
  id: string;
}
type WorkspaceViewProps = RouteComponentProps<WorkspaceViewRouteParams>;

interface WorkspaceViewState
{
  id: number;
  workspace?: WorkspaceStub;
  files: FileStub[];
  page: number;
}


// eslint-disable-next-line import/prefer-default-export
export class WorkspaceView extends React.Component<WorkspaceViewProps, WorkspaceViewState>
{

  constructor(props: WorkspaceViewProps)
  {
    super(props);

    const { match: { params: { id } } } = this.props;
    this.state = {
      id: parseInt(id, 10),
      files: [],
      page: 0,
    }

    this.loadWorkspace(parseInt(id, 10));

    this.onPageChange = this.onPageChange.bind(this);
  }

  async componentDidUpdate(_prevProps: WorkspaceViewProps, prevState: WorkspaceViewState)
  {
    const { id, page } = this.state;
    if (prevState.id !== id)
      this.loadWorkspace(id);
    else if (prevState.page !== page)
      this.loadFiles(id);
  }

  async onPageChange(newPage: number)
  {
    this.setState({
      page: newPage,
    });
    log.info('newPage', newPage);
  }

  async loadWorkspace(id: number)
  {
    const workspaceResponse = await Client.send<WorkspaceStub[]>('Workspace', { action: 'read', params: [id] });
    const workspaceSuccess = workspaceResponse.status === SocketRequestStatus.SUCCESS;
    if (!workspaceSuccess || !workspaceResponse.data)
    {
      log.error(`Failed to get workspace with given id: ${id}`);
      return;
    };

    const [ workspace ] = workspaceResponse.data;
    this.loadFiles(workspace.id);

    this.setState({
      workspace,
    });
  }

  async loadFiles(workspaceID: number)
  {
    const { page } = this.state;
    const itemsPerPage = 20;

    const where: FilterQuery<File> = {
      workspaces: { id: workspaceID },
    };
    const options: FindOptions<File> = {
      limit: itemsPerPage,
      offset: page * itemsPerPage,
    }

    const fileResponse = await Client.send<FileStub[]>('File', { action: 'read', params: [where, options] });
    const fileSuccess  = fileResponse.status === SocketRequestStatus.SUCCESS;
    if (!fileSuccess || !fileResponse.data)
    {
      log.error(`Failed to get files for workspace with given id: ${workspaceID}`);
      return;
    };

    const files = fileResponse.data;
    this.setState({
      files,
    });
  }

  render()
  {
    // const { name }  = this.workspace || "Loading...";
    const { workspace, files, page } = this.state;

    let name = 'Loading...';
    if (workspace) name = workspace.name;

    return (
      <>
        <h3>{name}&apos;s files...</h3> Page {page}
        <FileList files={files} paginate page={page} onPageChange={this.onPageChange}/>
        <Link to='/'>Back</Link>
      </>
    );
  }

};
