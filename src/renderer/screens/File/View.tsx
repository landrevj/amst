/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import { RouteComponentProps } from 'react-router';
// import { Link } from 'react-router-dom';
// import QueryString from 'query-string';
// import { FilterQuery, FindOptions } from '@mikro-orm/core';
import log from 'electron-log';


import Client from '../../../utils/websocket/SocketClient';
import { FileStub, TagStub } from '../../../db/entities';

import { SocketRequestStatus } from '../../../utils/websocket';
import TagForm from '../../components/Tag/Form';
import { mimeRegex } from '../../../utils';
import TagList from '../../components/Tag/List';

interface FileViewRouteParams
{
  id: string;
}
type FileViewProps = RouteComponentProps<FileViewRouteParams>;

interface FileViewState
{
  id: number;
  file?: FileStub;
  tags: TagStub[];
}

export default class FileView extends React.Component<FileViewProps, FileViewState>
{
  constructor(props: FileViewProps)
  {
    super(props);

    const { match: { params: { id } } } = this.props;

    this.state = {
      id: parseInt(id, 10),
      tags: [],
    };

    this.loadFile(parseInt(id, 10));

    this.handleTagFormSubmit = this.handleTagFormSubmit.bind(this);
    this.handleTagRemove = this.handleTagRemove.bind(this);
  }

  async componentDidUpdate(_prevProps: FileViewProps, prevState: FileViewState)
  {
    const { id } = this.state;

    if (prevState.id !== id) this.loadFile(id);
  }

  async handleTagFormSubmit(newTag: TagStub)
  {
    const { tags } = this.state;
    this.setState({
      tags: [...tags, newTag],
    });
  }

  async handleTagRemove(id: number)
  {
    const { tags } = this.state;
    console.log(id);

    const response = await Client.send<void>('Tag', { action: 'destroy', params: [id] });
    const success  = response.status === SocketRequestStatus.SUCCESS;

    if (success)
    {
      const where = tags.findIndex(tag => tag.id === id);
      tags.splice(where, 1);
      this.setState({ tags });
    }
  }

  async loadFile(id: number)
  {
    const response = await Client.send<FileStub[]>('File', { action: 'read', params: [id, { populate: ['tags'] }] });
    const success  = response.status === SocketRequestStatus.SUCCESS;
    if (!success || !response.data)
    {
      log.error(`Failed to get file with given id: ${id}`);
      return;
    }

    const [ file ] = response.data;
    this.setState({
      file,
      tags: file.tags || [],
    });
  }

  render()
  {
    const { file, tags } = this.state;
    if (file)
    {
      const { type } = mimeRegex(file.mimeType || '');
      let content: JSX.Element = <></>;
      if (type === 'image') content = <img className='max-h-screen' src={`http://${Client.host}:${Client.port}/files/${file.id}`} alt={file.name}/>;
      if (type === 'video')
      {
        content = (
          <video controls>
            <source src={`http://${Client.host}:${Client.port}/files/${file.id}`}/>
            Something wasnt supported!
          </video>
        );
      }
      if (type === 'audio') content = <audio controls src={`http://${Client.host}:${Client.port}/files/${file.id}`} />;

      return (
        <div>
          <div className='flex justify-center'>
            {content}
          </div>

          <p>{file.id}</p>
          <p>{file.name}</p>
          <p>{file.extension}</p>
          <p>{file.mimeType || '?'}</p>
          <p>{file.md5 || '?'}</p>
          <p>{file.createdAt}</p>
          <p>{file.fullPath}</p>


          <TagList tags={tags} onTagRemove={this.handleTagRemove}/>
          <TagForm fileID={file.id} onSubmit={this.handleTagFormSubmit}/>
        </div>
      );
    }

    return (
      <>
        <span>Loading...</span>
      </>
    );
  }
}
