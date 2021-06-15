/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import { RouteComponentProps } from 'react-router';
import Hotkeys from 'react-hot-keys';
import { HotkeysEvent } from 'hotkeys-js';
import log from 'electron-log';
import { QueryOrder } from '@mikro-orm/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { faExpandArrowsAlt, faPlus } from '@fortawesome/free-solid-svg-icons';


import Client from '../../../shared/websocket/SocketClient';
import { FileStub, GroupMemberStub, GroupStub, TagStub } from '../../../db/entities';

import { SocketRequestStatus } from '../../../shared/websocket';
import { withSearchQuery, SearchQueryProps } from '../../components/UI/Search/Query';
import GroupSearchQuery, { IGroupSearchQuery } from '../../components/Group/Search/Query';
import TagList from '../../components/Tag/List';
import { Card, CardHeader } from '../../components/UI/Card';
import TagForm from '../../components/Tag/Form';
import FilePreview from '../../components/File/Preview/Preview';
import FilePreviewList from '../../components/File/Preview/List';
import FileSearchQuery from '../../components/File/Search/Query';
import { mimeRegex } from '../../../utils';
import { TitlebarContext } from '../../components/Titlebar/Titlebar';
import QueryNav from '../../components/UI/Search/Query/Nav';

interface GroupViewRouteParams
{
  id: string;
}
type GroupViewProps = SearchQueryProps<IGroupSearchQuery, GroupStub, GroupSearchQuery> & RouteComponentProps<GroupViewRouteParams>;

interface GroupViewState
{
  // id: number;
  group?: GroupStub;
  tags: TagStub[];
  members?: GroupMemberStub[];
  sorting: boolean;
}

class FileView extends React.Component<GroupViewProps, GroupViewState>
{
  static contextType = TitlebarContext;
  context!: React.ContextType<typeof TitlebarContext>;

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
      sorting: false,
    };

    this.handleTagFormSubmit = this.handleTagFormSubmit.bind(this);
    this.handleTagRemove = this.handleTagRemove.bind(this);
    this.handleSetSorting = this.handleSetSorting.bind(this);
    this.handleSort = this.handleSort.bind(this);

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

  handleSetSorting(sorting: boolean)
  {
    this.setState({ sorting });
  }

  async handleSort(sortedFiles: FileStub[])
  {
    const { group, members: originalMembers } = this.state;
    if (!group) return;

    const memberDict: { [fileId: number]: GroupMemberStub } = {};
    // want to be able to grab members by their associated file's id
    // this will save us from having to iterate over the member array multiple times
    originalMembers?.forEach(m => { memberDict[m.file.id] = m });

    const changedPos: [number, number][] = [];
    const sortedMembers = sortedFiles.map((f, i)=> {
      const member = memberDict[f.id];
      if (member.position !== i) changedPos.push([f.id, i]);

      return { ...member, position: i } as GroupMemberStub;
    });

    // set the state right away so the drop animation plays properly
    this.setState({ members: sortedMembers });

    const response = await Client.send('Group', { action: 'updateMemberPositions', params: [group.id, changedPos] });
    const success = response.status === SocketRequestStatus.SUCCESS;

    // if the backend fails to update then undo the changes
    if (!success) this.setState({ members: originalMembers });
  }

  onKeyDown(_shortcut: string, _e: KeyboardEvent, handler: HotkeysEvent)
  {
    const { prevPage, nextPage } = this.props;
    switch(handler.key)
    {
      case 'left':
      case 'a':
        this.handleSetSorting(false);
        prevPage();
        break;

      case 'right':
      case 'd':
        this.handleSetSorting(false);
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
      members: g.members.sort((a, b) => a.position - b.position),
    });

    const { page, maxPage } = this.props;
    const { setSubtitle } = this.context;

    const p = (page + 1).toLocaleString();
    const mp = (maxPage + 1).toLocaleString();
    await setSubtitle(`group - ${p}/${mp} - ${group.name}`);
  }


  render()
  {
    const { loading, query, page, maxPage, nextPage, prevPage, goToPage, parentPath } = this.props;
    const { group, tags, members, sorting } = this.state;
    // if (!file && !loading) return (<span>no file</span>)
    const fileQuery = new FileSearchQuery({ groupID: group?.id, order: QueryOrder.ASC, instanceID: query.instanceID, parentInstanceID: query.instanceID }, true);

    let coverDiv;
    if (members?.length)
    {
      const coverFile = members[0].file;
      const { type } = mimeRegex(coverFile.mimeType || '');
      const coverFileMime = type;
      coverDiv = coverFile && coverFileMime === 'image' ?
      <Card translucent className='flex-none'>
        <FilePreview file={coverFile} showName={false} className='w-64 max-w-full max-h-full' imgClassName='max-h-full'/>
      </Card>
        : null;
    }


    return (
      <>
      <Hotkeys keyName='left,right,a,d' onKeyDown={this.onKeyDown} disabled={sorting}/>

      <div className='p-4 space-y-4 h-screen-minus-titlebar overflow-auto scrollbar-light'>

        <div className='flex flex-row gap-4 flex-none'>
          {group && !loading ? coverDiv :
          <Card translucent className='flex-none'>
            <div className='w-64 h-36 animate-pulse bg-gray-100 rounded'/>
          </Card>}

          <Card className='flex-grow gap-4' flexDirection='col' overflow='visible'>

            <div className='flex-grow flex flex-col gap-4'>
              {group && !loading ?
              <CardHeader text={group?.name}>
                <div className='flex-grow'/>
                <div className='flex flex-row place-items-center text-base text-gray-500 space-x-1 pl-2'>
                  <FontAwesomeIcon icon={faCopy}/>
                  <span>{members?.length}</span>
                </div>
              </CardHeader>
              :
              <div className='flex flex-row animate-fade-in place-items-center'>
                <div className='!bg-gray-400 text-base-loading w-36'/>
                <div className='flex-grow'/>
                <div className='!bg-gray-400 text-sm-loading w-14'/>
              </div>}

              <hr/>

              <TagList tags={tags} searchTagTuples={query.tags} handleTagRemove={this.handleTagRemove} loading={loading}/>

              {group && !loading ?
              <div className='flex flex-row gap-1'>
                <span className='flex place-items-center px-2.5 text-sm rounded-full text-white filter saturate-[.9] bg-gradient-to-r from-green-400 to-green-300'>
                  <FontAwesomeIcon icon={faPlus}/>
                </span>
                <TagForm channel='Group' groupID={group.id} onSubmit={this.handleTagFormSubmit}/>
              </div> : null}
            </div>

            <div className='flex flex-col gap-4'>
              <hr/>
              <QueryNav
                loading={loading}
                id={group?.id}
                page={page} maxPage={maxPage}
                prevPage={prevPage} nextPage={nextPage} goToPage={goToPage}
                backPath={parentPath}
              />
            </div>

          </Card>
        </div>

        <Card className='max-h-unset'>

          <CardHeader className='py-1 mb-4 border-b-2 border-gray-100' inset>
            <div className='text-gray-400'>
              <button type='button' className={`hover:text-blue-400 ${sorting ? 'text-blue-400' : ''}`} onClick={() => this.handleSetSorting(!sorting)}>
                <FontAwesomeIcon className='align-middle' icon={faExpandArrowsAlt}/>
              </button>
            </div>
            <div className='flex-grow'/>
          </CardHeader>

          <FilePreviewList loading={loading} sorting={sorting} onSort={this.handleSort} files={members?.map(m => m.file) || []} query={fileQuery} QueryConstructor={FileSearchQuery}/>
        </Card>
      </div>
      </>
    );
  }
}

export default withSearchQuery<IGroupSearchQuery, GroupStub, GroupSearchQuery>(GroupSearchQuery, { defaultPerPage: 1 })(FileView);
