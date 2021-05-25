import React from 'react';
import { TagTuple } from './index';
import { TagStub } from '../../../db/entities';
import { SocketRequestStatus } from '../../../shared/websocket';
import Client from '../../../shared/websocket/SocketClient';
import TagInput from './Input';

interface TagFormProps
{
  channel: 'File' | 'Group';
  fileID?: number;
  groupID?: number;
  onSubmit: (newTag: TagStub) => void;
}

export default class TagForm extends React.Component<TagFormProps>
{
  constructor(props: TagFormProps)
  {
    super(props);

    const { channel, fileID, groupID } = this.props;

    if (channel === 'File' && groupID)
    {
      throw new Error('Tag/Form.tsx: groupID specified when channel is set to Group');
    }
    if (channel === 'Group' && fileID)
    {
      throw new Error('Tag/Form.tsx: fileID specified when channel is set to File');
    }

    this.handleTagInputSubmit = this.handleTagInputSubmit.bind(this);
  }

  async handleTagInputSubmit(tag: TagTuple)
  {
    const { channel, fileID, groupID, onSubmit } = this.props;

    const response = await Client.send<TagStub>(channel, { action: 'addTag', params: [fileID || groupID, ...tag] });
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
