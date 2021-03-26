import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import QueryString from 'query-string';
import { FilterQuery, FindOptions } from '@mikro-orm/core';
import log from 'electron-log';


import Client from '../../../utils/websocket/SocketClient';
import { WorkspaceStub, FileStub, File } from '../../../db/entities';
import FilePreviewList from '../../components/File/Preview/List';

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

    const { match: { params: { id } }, location: { search } } = this.props;
    const query = QueryString.parse(search);
    const page = (query.page && !Array.isArray(query.page)) ? parseInt(query.page, 10) : 0;

    this.state = {
      id: parseInt(id, 10),
      files: [],
      page,
    }

    this.loadWorkspace(parseInt(id, 10));
  }

  async componentDidUpdate(prevProps: WorkspaceViewProps, prevState: WorkspaceViewState)
  {
    const { id, page } = this.state;

    if (prevState.id !== id)
      this.loadWorkspace(id);
    else if (prevState.page !== page)
      this.loadFiles(id);

    const { location: { search } } = this.props;
    if (prevProps.location.search !== search)
    {
      this.loadPage(search);
    }
  }

  async loadPage(search: string)
  {
    const query = QueryString.parse(search);
    const page = (query.page && !Array.isArray(query.page)) ? parseInt(query.page, 10) : 0;

    this.setState({
      page,
    });
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
    const { id, workspace, files, page } = this.state;

    const name = workspace ? workspace.name : 'Loading...';

    const prevPageLink = page > 0 ? (<Link to={`/workspace/${id}?page=${page - 1}`}>prev</Link>) : (<span>prev</span>);
    const nextPageLink =            (<Link to={`/workspace/${id}?page=${page + 1}`}>next</Link>);

    return (
      <>
        <h3>{name}&apos;s files...</h3> Page {page} &nbsp;
        {prevPageLink} &nbsp;
        {nextPageLink}
        <FilePreviewList files={files} />
        <Link to='/'>Back</Link>
      </>
    );
  }

};
