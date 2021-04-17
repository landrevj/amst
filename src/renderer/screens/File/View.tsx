/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import TimeAgo from 'javascript-time-ago';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleLeft, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import log from 'electron-log';


import Client from '../../../utils/websocket/SocketClient';
import { FileStub, TagStub } from '../../../db/entities';

import { SocketRequestStatus } from '../../../utils/websocket';
import TagForm from '../../components/Tag/Form';
import { mimeRegex } from '../../../utils';
import TagList from '../../components/Tag/List';
import withFileSearchQuery, { WithFileSearchQueryProps } from '../../components/File/Search/Query/with';

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
    this.handleCalculateMD5 = this.handleCalculateMD5.bind(this);
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

  async handleCalculateMD5()
  {
    const { file } = this.state;
    if (!file) return;

    const response = await Client.send<string>('File', { action: 'calculateMD5', params: file.id });
    const success  = response.status === SocketRequestStatus.SUCCESS;
    if (!success || !response.data)
    {
      log.error(`An error occurred while calculating MD5 for file with id: ${file.id}`);
      return;
    }

    const newFile: FileStub = { ...file, md5: response.data };
    this.setState({ file: newFile });
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
    const { page, maxPage, prevPage, nextPage, query, parentQuery } = this.props;
    const { file, tags } = this.state;
    if (!file) return ( <span>Loading...</span> );

    const { type } = mimeRegex(file.mimeType || '');
    let content: JSX.Element = <></>;
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

    const md5Button = <button type='button' onClick={this.handleCalculateMD5}>update</button>;
    const timeAgo = new TimeAgo();
    return (
      <div>
        <div className='fixed flex w-full h-screen bg-gray-900'>
          <div className='m-auto'>
            {content}
          </div>
        </div>


        <div className='absolute top-full w-full pb-5 bg-gray-100'>
          <div className='flex flex-row px-3 py-1'>
            <button type='button' className='h-6 bg-transparent' onClick={prevPage}>
              <FontAwesomeIcon className='mr-2 fill-current text-gray-600' icon={faChevronLeft}/>
              prev
            </button>

            <div className='flex-grow text-center'>
              <span className='px-2 rounded-full bg-blue-300'>
                #{file.id} - {page + 1}/{maxPage + 1}
              </span>
              <br/>
              <Link className='inline-block px-2 rounded-full bg-green-300' to={`/file?${parentQuery || ''}`}>
                <FontAwesomeIcon className='mr-1 -ml-1 my-auto fill-current text-gray-100' icon={faArrowCircleLeft}/>
                <span>search</span>
              </Link>
            </div>

            <button type='button' className='h-6 bg-transparent' onClick={nextPage}>
              next
              <FontAwesomeIcon className='ml-2 fill-current text-gray-600' icon={faChevronRight}/>
            </button>
          </div>

          <div className='flex flex-row flex-wrap justify-evenly'>
            <div className='flex-initial max-w-4xl px-4 py-10'>
              <TagList tags={tags} searchTagTuples={query.tags} onTagRemove={this.handleTagRemove}/>
              <div className='flex flex-row mt-5'>
                <div className='mr-1 px-2 py-1 text-sm rounded-full bg-green-200 border-2 border-solid border-green-200'>new tag</div>
                <TagForm fileID={file.id} onSubmit={this.handleTagFormSubmit}/>
              </div>
            </div>

            <div className='flex-initial max-w-4xl px-4 py-10'>
              <table className='table-fixed'>
                <tbody>
                  <tr><td className='text-right font-bold pr-2'>#</td><td className='break-all'>{file.id}</td></tr>
                  <tr><td className='text-right font-bold pr-2'>name</td><td className='break-all'>{file.name}</td></tr>
                  <tr><td className='text-right font-bold pr-2'>extension</td><td className='break-all'>{file.extension}</td></tr>
                  <tr><td className='text-right font-bold pr-2'>mime</td><td className='break-all'>{file.mimeType || 'unknown'}</td></tr>
                  <tr><td className='text-right font-bold pr-2'>md5</td><td className='break-all'>{file.md5 || md5Button}</td></tr>
                  <tr><td className='text-right font-bold pr-2'>imported</td><td className='break-all'>{timeAgo.format(Date.parse(file.createdAt))}</td></tr>
                  <tr><td className='text-right font-bold pr-2'>path</td><td className='break-all'>{file.fullPath}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withFileSearchQuery({ defaultFilesPerPage: 1 })(FileView);
