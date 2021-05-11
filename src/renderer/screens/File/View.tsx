/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import Hotkeys from 'react-hot-keys';
import { HotkeysEvent } from 'hotkeys-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleLeft, faChevronLeft, faChevronRight, faImage } from '@fortawesome/free-solid-svg-icons';
import log from 'electron-log';


import Client from '../../../utils/websocket/SocketClient';
import { FileStub, TagStub } from '../../../db/entities';

import { SocketRequestStatus } from '../../../utils/websocket';
import TagForm from '../../components/Tag/Form';
import { mimeRegex } from '../../../utils';
import TagList from '../../components/Tag/List';
import withFileSearchQuery, { WithFileSearchQueryProps } from '../../components/File/Search/Query/with';
import { Card } from '../../components/UI/Card';
import FilePropertyTable from '../../components/File/PropertyTable';

interface FileViewRouteParams
{
  id: string;
}
type FileViewProps = WithFileSearchQueryProps & RouteComponentProps<FileViewRouteParams>;

interface FileViewState
{
  // id: number;
  file?: FileStub;
  tags: TagStub[];
}

class FileView extends React.Component<FileViewProps, FileViewState>
{
  constructor(props: FileViewProps)
  {
    super(props);

    // const { match: { params: { id } } } = this.props;
    const { files } = this.props;
    const file = files[0] || undefined;
    this.state = {
      file,
      tags: [],
    };

    this.handleTagFormSubmit = this.handleTagFormSubmit.bind(this);
    this.handleTagRemove = this.handleTagRemove.bind(this);
    this.handleUpdateMD5 = this.handleUpdateMD5.bind(this);

    this.onKeyDown = this.onKeyDown.bind(this);
  }

  async componentDidUpdate(prevProps: FileViewProps)
  {
    const { files } = this.props;
    if (prevProps.files[0] !== files[0]) this.loadFile();
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
    const { files } = this.props;
    const file = files[0] || undefined;

    const response = await Client.send<TagStub[]>('Tag', { action: 'read', params: [{ file: { id: file.id } }] });
    const success  = response.status === SocketRequestStatus.SUCCESS;
    if (!success || !response.data)
    {
      log.error(`Failed to get tags for file with given id: ${file.id}`);
      return;
    }

    const tags = response.data;
    this.setState({
      file,
      tags,
    });
  }

  render()
  {
    const { loading, page, maxPage, prevPage, nextPage, query, parentQuery } = this.props;
    const { file, tags } = this.state;
    if (!file && !loading) return (<span>no file</span>)


    let content: JSX.Element | undefined;
    if (file && !loading)
    {
      const { type } = mimeRegex(file.mimeType || '');
      if (type === 'image') content = <img className='max-h-screen' src={`http://${Client.host}:${Client.port}/files/${file.id}`} alt={file.name}/>;
      if (type === 'video')
      {
        content = (
          // we set the key here so the video will always update the video source when the file changes
          // this wasnt an issue initially but at some point it became one. idk what happened
          // but it would update the source in the html but the video would still be the same
          <video className='max-h-screen' key={file.id} controls>
            <source src={`http://${Client.host}:${Client.port}/files/${file.id}`}/>
            Something wasnt supported!
          </video>
        );
      }
      if (type === 'audio') content = <audio controls src={`http://${Client.host}:${Client.port}/files/${file.id}`} />;
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


      <div className='h-full overflow-auto bg-gray-900'>
        {content ?
        <div className='sticky top-0 flex w-full h-screen-minus-titlebar'>
          <div className='m-auto'>
            {content}
          </div>
        </div> : <></>}

        <div className={`w-full p-4 ${content ? 'pt-0' : ''}`}>

          <Card className='relative w-full p-4'>
            <div className='flex flex-row'>
              <button type='button' className='h-6 bg-transparent' onClick={prevPage}>
                <FontAwesomeIcon className='mr-2 fill-current text-gray-600' icon={faChevronLeft}/>
                <span>prev</span>
              </button>

              <div className='flex-grow text-center'>
                {file && !loading ? <>
                <span className='px-2 rounded-full bg-blue-300'>
                  #{file.id} - {page + 1}/{maxPage + 1}
                </span>
                <br/>
                <Link className='inline-block px-2 rounded-full bg-green-300' to={`/file?${parentQuery || ''}`}>
                  <FontAwesomeIcon className='mr-1 -ml-1 my-auto fill-current text-gray-100' icon={faArrowCircleLeft}/>
                  <span>search</span>
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

            <div className='flex flex-row flex-wrap justify-evenly'>
              <div className='flex-initial max-w-full px-4 py-10'>
                <TagList tags={tags} searchTagTuples={query.tags} onTagRemove={this.handleTagRemove} loading={loading}/>
                {file && !loading ?
                <div className='flex flex-row mt-5'>
                  <div className='mr-1 px-2 py-1 text-sm rounded-full bg-green-200 border-2 border-solid border-green-200'>new tag</div>
                  <TagForm fileID={file.id} onSubmit={this.handleTagFormSubmit}/>
                </div> : <></>}
              </div>

              <div className='flex-initial max-w-full px-4 py-10'>
                <FilePropertyTable file={file} loading={loading} updateMD5={this.handleUpdateMD5}/>
              </div>
            </div>
          </Card>

        </div>

      </div>
      </>
    );
  }
}

export default withFileSearchQuery({ defaultFilesPerPage: 1 })(FileView);
