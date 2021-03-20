import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import log from 'electron-log';

import Client from '../../../utils/websocket/SocketClient';
import { WorkspaceStub, FileStub } from '../../../db/entities';
import FileList from '../../components/File/List';

import '../../../App.global.scss';
import { SocketRequestStatus } from '../../../utils/websocket';
import { isNumberArray } from '../../../utils';

interface WorkspaceViewRouteParams
{
  id: string;
}
type WorkspaceViewProps = RouteComponentProps<WorkspaceViewRouteParams>;

interface WorkspaceViewState
{
  id: number;
  stub?: WorkspaceStub;
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
    }

    this.loadWorkspace(parseInt(id, 10));
  }

  async componentDidUpdate(_prevProps: WorkspaceViewProps, prevState: WorkspaceViewState)
  {
    const { id } = this.state;
    if (prevState.id !== id)
      this.loadWorkspace(id);
  }

  async loadWorkspace(id: number)
  {
    // const workspace = await DB.em?.findOne(Workspace, { id }, ['files']);
    const response = await Client.send<WorkspaceStub[]>('Workspace', { action: 'getWorkspaces', params: [{ id }, ['files']] });
    const success = response.status === SocketRequestStatus.SUCCESS;

    if (success && response.data)
    {
      const [ stub ] = response.data;

      this.setState({
        stub,
      });
    }
    else log.error(`Failed to get files from workspace with given id: ${id}`);
  }

  render()
  {
    // const { name }  = this.workspace || "Loading...";
    const { stub } = this.state;
    let name = 'Loading...';
    let files: FileStub[] = [];

    if (stub)
    {
      name = stub.name;
      if (stub.files && !isNumberArray(stub.files))
        files = stub.files;
    }

    return (
      <>
        <h3>{name}&apos;s files...</h3>
        <FileList files={files}/>
        <Link to='/'>Back</Link>
      </>
    );
  }

};
