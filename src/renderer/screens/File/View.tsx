/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import Hotkeys from 'react-hot-keys';
import { HotkeysEvent } from 'hotkeys-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleLeft, faChevronLeft, faChevronRight, faFile, faImage, faLayerGroup, faPlus, faTags } from '@fortawesome/free-solid-svg-icons';
import log from 'electron-log';


import Client from '../../../utils/websocket/SocketClient';
import { FileStub, GroupStub, TagStub } from '../../../db/entities';

import { SocketRequestStatus } from '../../../utils/websocket';
import TagForm from '../../components/Tag/Form';
import { mimeRegex } from '../../../utils';
import TagList from '../../components/Tag/List';
import withSearchQuery, { WithSearchQueryProps } from '../../components/UI/Search/Query/with';
import { Card, CardSection } from '../../components/UI/Card';
import FilePropertyTable from '../../components/File/PropertyTable';
import FileSearchQuery, { IFileSearchQuery } from '../../components/File/Search/Query';
import { PARENT_FILE_SEARCH_QUERY } from '../../SessionStorageKeys';

interface FileViewRouteParams
{
  id: string;
}
type FileViewProps = WithSearchQueryProps<IFileSearchQuery, FileStub, FileSearchQuery> & RouteComponentProps<FileViewRouteParams>;

interface FileViewState
{
  // id: number;
  file?: FileStub;
  tags: TagStub[];
  groups: GroupStub[];
}

class FileView extends React.Component<FileViewProps, FileViewState>
{
  constructor(props: FileViewProps)
  {
    super(props);

    // const { match: { params: { id } } } = this.props;
    const { results } = this.props;
    const file = results[0] || undefined;
    this.state = {
      file,
      tags: [],
      groups: [],
    };

    this.handleTagFormSubmit = this.handleTagFormSubmit.bind(this);
    this.handleTagRemove = this.handleTagRemove.bind(this);
    this.handleUpdateMD5 = this.handleUpdateMD5.bind(this);

    this.onKeyDown = this.onKeyDown.bind(this);
  }

  async componentDidUpdate(prevProps: FileViewProps)
  {
    const { results } = this.props;
    if (prevProps.results[0] !== results[0]) this.loadFile();
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

  handleUpdateMD5(md5: string)
  {
    const { file } = this.state;
    if (!file) return;

    const newFile: FileStub = { ...file, md5 };
    this.setState({ file: newFile });
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

  async loadFile()
  {
    const { results } = this.props;
    const file = results[0] || undefined;

    const response = await Client.send<FileStub[]>('File', { action: 'read', params: [file.id, { populate: ['tags', 'managedGroups', 'groupMemberships.group'] }] });
    const success  = response.status === SocketRequestStatus.SUCCESS;
    if (!success || !response.data)
    {
      log.error(`Failed to get tags for file with given id: ${file.id}`);
      return;
    }

    const f = response.data[0];
    const g = [...(f.managedGroups), ...(f.groupMemberships.map(m => m.group))];

    this.setState({
      file,
      tags: f.tags || [],
      groups: g,
    });
  }

  render()
  {
    const { loading, page, maxPage, prevPage, nextPage, query, parentQuery, history } = this.props;
    const { file, tags, groups } = this.state;
    // if (!file && !loading) return (<span>no file</span>)
    console.log(history)

    let content: JSX.Element | undefined;
    if (file && !loading)
    {
      const { type } = mimeRegex(file.mimeType || '');
      if (type === 'image') content = <img className='max-h-full' src={`http://${Client.host}:${Client.port}/files/${file.id}`} alt={file.name}/>;
      else if (type === 'video')
      {
        content = (
          // we set the key here so the video will always update the video source when the file changes
          // this wasnt an issue initially but at some point it became one. idk what happened
          // but it would update the source in the html but the video would still be the same
          <video className='max-h-full' key={file.id} controls>
            <source src={`http://${Client.host}:${Client.port}/files/${file.id}`}/>
            Something wasnt supported!
          </video>
        );
      }
      else if (type === 'audio') content = <audio controls src={`http://${Client.host}:${Client.port}/files/${file.id}`} />;
    }
    else
    {
      content = (
        <Card className='w-[65vw] h-[55vh] bg-gradient-to-tr from-indigo-800 via-blue-500 to-teal-500 filter saturate-[0.75] animate-fade-in'>
          <div className='absolute w-full h-full text-white p-10 animate-pulse'>
            <FontAwesomeIcon className='!w-full !h-full' icon={faImage}/>
          </div>
        </Card>
      )
    }

    return (
      <>
      <Hotkeys keyName='left,right,a,d' onKeyDown={this.onKeyDown}/>


      <div className={`h-full overflow-auto ${content ? 'bg-gray-900' : ''} scrollbar-light transition-colors`}>
        {content ?
        <div className='sticky top-0 flex justify-center place-items-center w-full h-screen-minus-titlebar'>
          {content}
        </div> : <></>}

        <div className={`w-full p-4 ${content ? 'pt-0' : ''}`}>

          <Card className='relative w-full space-y-4'>

            <div className='flex flex-row'>
              <button type='button' className='h-6 bg-transparent' onClick={prevPage}>
                <FontAwesomeIcon className='mr-2 fill-current text-gray-600' icon={faChevronLeft}/>
                <span>prev</span>
              </button>

              <div className='flex-grow text-center'>
                {file && !loading ? <>
                <span className='px-2 rounded-full bg-gray-300'>
                  #{file.id}
                </span>
                <br/>
                <Link className='inline-block px-2 rounded-full text-white filter saturate-[.9] bg-gradient-to-tr from-blue-400 to-blue-300' to={`/file?${parentQuery || ''}`}>
                  <FontAwesomeIcon className='mr-1 -ml-1 my-auto fill-current text-gray-100' icon={faArrowCircleLeft}/>
                  <span>search</span>
                  <span> | ({page + 1}/{maxPage + 1})</span>
                </Link>
                </>
                :
                <div className='animate-fade-in'><span className='text-base-loading inline-block w-36'/></div>}
              </div>

              <button type='button' className='h-6 bg-transparent' onClick={nextPage}>
                <span>next</span>
                <FontAwesomeIcon className='ml-2 fill-current text-gray-600' icon={faChevronRight}/>
              </button>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3 gap-4'>

              <CardSection className='bg-gray-100' headerIcon={faTags}>
                <div className='space-y-4'>
                  <TagList tags={tags} searchTagTuples={query.tags} handleTagRemove={this.handleTagRemove} loading={loading}/>
                  {file && !loading ?
                  <div className='flex flex-row gap-1'>
                    <span className='flex place-items-center px-2.5 text-sm rounded-full text-white filter saturate-[.9] bg-gradient-to-r from-green-400 to-green-300'>
                      <FontAwesomeIcon icon={faPlus}/>
                    </span>
                    <TagForm channel='File' fileID={file.id} onSubmit={this.handleTagFormSubmit}/>
                  </div> : <></>}
                </div>
              </CardSection>

              <CardSection className='bg-gray-100' headerIcon={faLayerGroup}>
                {/* eslint-disable-next-line react/no-array-index-key */}
                {groups.map((g, i) => <p key={i}>{g.name}</p>)}
              </CardSection>

              <CardSection className='bg-gray-100' headerIcon={faFile}>
                <FilePropertyTable file={file} loading={loading} updateMD5={this.handleUpdateMD5}/>
              </CardSection>

            </div>
          </Card>

        </div>

      </div>
      </>
    );
  }
}

export default withSearchQuery<IFileSearchQuery, FileStub, FileSearchQuery>(FileSearchQuery, { parentQuerySessionKey: PARENT_FILE_SEARCH_QUERY, defaultPerPage: 1 })(FileView);
