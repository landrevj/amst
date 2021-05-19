/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import { RouteComponentProps } from 'react-router';
import Hotkeys from 'react-hot-keys';
import { HotkeysEvent } from 'hotkeys-js';
import log from 'electron-log';


import Client from '../../../utils/websocket/SocketClient';
import { GroupMemberStub, GroupStub, TagStub } from '../../../db/entities';

import { SocketRequestStatus } from '../../../utils/websocket';
import withSearchQuery, { WithSearchQueryProps } from '../../components/UI/Search/Query/with';
import { PARENT_GROUP_SEARCH_QUERY } from '../../SessionStorageKeys';
import GroupSearchQuery, { IGroupSearchQuery } from '../../components/Group/Search/Query';
import TagList from '../../components/Tag/List';
import { Card } from '../../components/UI/Card';
import TagForm from '../../components/Tag/Form';

interface GroupViewRouteParams
{
  id: string;
}
type GroupViewProps = WithSearchQueryProps<IGroupSearchQuery, GroupStub, GroupSearchQuery> & RouteComponentProps<GroupViewRouteParams>;

interface GroupViewState
{
  // id: number;
  group?: GroupStub;
  tags: TagStub[];
  members?: GroupMemberStub[];
}

class FileView extends React.Component<GroupViewProps, GroupViewState>
{
  constructor(props: GroupViewProps)
  {
    super(props);

    // const { match: { params: { id } } } = this.props;
    const { results } = this.props;
    const group = results[0] || undefined;
    this.state = {
      group,
      tags: [],
      members: [],
    };

    this.handleTagFormSubmit = this.handleTagFormSubmit.bind(this);
    this.handleTagRemove = this.handleTagRemove.bind(this);

    this.onKeyDown = this.onKeyDown.bind(this);
  }

  async componentDidUpdate(prevProps: GroupViewProps)
  {
    const { results } = this.props;
    if (prevProps.results[0] !== results[0]) this.loadGroup();
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

    const response = await Client.send<void>('Tag', { action: 'destroy', params: [id] });
    const success  = response.status === SocketRequestStatus.SUCCESS;

    if (success)
    {
      const where = tags.findIndex(tag => tag.id === id);
      tags.splice(where, 1);
      this.setState({ tags });
    }
  }

  onKeyDown(_shortcut: string, _e: KeyboardEvent, handler: HotkeysEvent)
  {
    const { prevPage, nextPage } = this.props;
    switch(handler.key)
    {
      case 'left':
      case 'a':
        prevPage();
        break;

      case 'right':
      case 'd':
        nextPage();
        break;

      default:
        break;
    }
  }

  async loadGroup()
  {
    const { results } = this.props;
    const group = results[0] || undefined;

    const response = await Client.send<GroupStub[]>('Group', { action: 'read', params: [group.id, { populate: ['tags', 'members.file'] }] });
    const success  = response.status === SocketRequestStatus.SUCCESS;
    if (!success || !response.data)
    {
      log.error(`Failed to get tags for file with given id: ${group.id}`);
      return;
    }

    const g = response.data[0];

    this.setState({
      group,
      tags: g.tags || [],
      members: g.members,
    });
  }

  render()
  {
    const { loading, query } = this.props;
    const { group, tags, members } = this.state;
    // if (!file && !loading) return (<span>no file</span>)


    return (
      <>
      <Hotkeys keyName='left,right,a,d' onKeyDown={this.onKeyDown}/>

      <div className='p-4 space-y-4'>
        <Card>
          <div className='space-y-4'>
            <TagList tags={tags} searchTagTuples={query.tags} handleTagRemove={this.handleTagRemove} loading={loading}/>
            {group && !loading ?
            <div className='flex flex-row'>
              <div className='mr-1 px-2 py-1 text-sm rounded-full bg-green-200 border-2 border-solid border-green-200'>new tag</div>
              <TagForm channel='Group' groupID={group.id} onSubmit={this.handleTagFormSubmit}/>
            </div> : <></>}
          </div>
        </Card>

        <Card>
          {members?.map(m =>  <div key={m.file.id}>{m.file.filePath}/{m.file.archivePath}</div>)}
        </Card>
      </div>
      </>
    );
  }
}

export default withSearchQuery<IGroupSearchQuery, GroupStub, GroupSearchQuery>(GroupSearchQuery, { parentQuerySessionKey: PARENT_GROUP_SEARCH_QUERY, defaultPerPage: 1 })(FileView);
