import React from 'react';
import { TagTuple } from './index';
import { TagStub } from '../../../db/entities';
import { SocketRequestStatus } from '../../../utils/websocket';
import Client from '../../../utils/websocket/SocketClient';
import TagInput from './Input';

interface TagFormProps
{
  fileID: number;
  onSubmit: (newTag: TagStub) => void;
}

export default class TagForm extends React.Component<TagFormProps>
{
  constructor(props: TagFormProps)
  {
    super(props);

    this.handleTagInputSubmit = this.handleTagInputSubmit.bind(this);
  }

  async handleTagInputSubmit(tag: TagTuple)
  {
    const { fileID, onSubmit } = this.props;

    const response = await Client.send<TagStub>('File', { action: 'addTag', params: [fileID, ...tag] });
    const success  = response.status === SocketRequestStatus.SUCCESS;

    if (success && response.data) onSubmit(response.data);
  }

  render()
  {
    return (
      <div>
        <TagInput className='px-2 py-1 text-sm rounded-full bg-gray-100 border-2 border-solid border-gray-300' onSubmit={this.handleTagInputSubmit}/>
      </div>
    );
  }
}
