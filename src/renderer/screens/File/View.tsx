import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
// import QueryString from 'query-string';
// import { FilterQuery, FindOptions } from '@mikro-orm/core';
import log from 'electron-log';


import Client from '../../../utils/websocket/SocketClient';
import { FileStub } from '../../../db/entities';

import { SocketRequestStatus } from '../../../utils/websocket';
// import '../../../App.global.scss';

interface FileViewRouteParams
{
  id: string;
}
type FileViewProps = RouteComponentProps<FileViewRouteParams>;

interface FileViewState
{
  id: number;
  file?: FileStub;
}

export default class FileView extends React.Component<FileViewProps, FileViewState>
{
  constructor(props: FileViewProps)
  {
    super(props);

    const { match: { params: { id } } } = this.props;

    this.state = {
      id: parseInt(id, 10),
    };

    this.loadFile(parseInt(id, 10));
  }

  async componentDidUpdate(_prevProps: FileViewProps, prevState: FileViewState)
  {
    const { id } = this.state;

    if (prevState.id !== id) this.loadFile(id);
  }

  async loadFile(id: number)
  {
    const response = await Client.send<FileStub[]>('File', { action: 'read', params: [id] });
    const success  = response.status === SocketRequestStatus.SUCCESS;
    if (!success || !response.data)
    {
      log.error(`Failed to get file with given id: ${id}`);
      return;
    }

    const [ file ] = response.data;
    this.setState({ file });
  }

  render()
  {
    const { file } = this.state;
    if (file)
    {
      return (
        <>
          <p>{file.id}</p>
          <p>{file.name}</p>
          <p>{file.extension}</p>
          <p>{file.createdAt}</p>
          <p>{file.fullPath}</p>
          <hr/>
          <Link to='/'>Back</Link>
        </>
      );
    }

    return (
      <>
        <span>Loading...</span>
        <Link to='/'>Back</Link>
      </>
    );
  }
}
