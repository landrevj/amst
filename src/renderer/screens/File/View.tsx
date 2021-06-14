/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import { RouteComponentProps } from 'react-router';
import Hotkeys from 'react-hot-keys';
import { HotkeysEvent } from 'hotkeys-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faLayerGroup, faPlus, faTags } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import log from 'electron-log';


import Client from '../../../shared/websocket/SocketClient';
import { FileStub, GroupStub, TagStub } from '../../../db/entities';

import { SocketRequestStatus } from '../../../shared/websocket';
import TagForm from '../../components/Tag/Form';
import { mimeRegex } from '../../../utils';
import TagList from '../../components/Tag/List';
import { withSearchQuery, SearchQueryProps } from '../../components/UI/Search/Query';
import { Card, CardSection } from '../../components/UI/Card';
import FilePropertyTable from '../../components/File/PropertyTable';
import FileSearchQuery, { IFileSearchQuery } from '../../components/File/Search/Query';
import { TitlebarContext } from '../../components/Titlebar/Titlebar';
import GroupSearchQuery from '../../components/Group/Search/Query';
import QueryNav from '../../components/UI/Query/Nav';

interface FileViewRouteParams
{
  id: string;
}
type FileViewProps = SearchQueryProps<IFileSearchQuery, FileStub, FileSearchQuery> & RouteComponentProps<FileViewRouteParams>;

interface FileViewState
{
  // id: number;
  file?: FileStub;
  tags: TagStub[];
  groups: GroupStub[];
}

class FileView extends React.Component<FileViewProps, FileViewState>
{
  static contextType = TitlebarContext;
  context!: React.ContextType<typeof TitlebarContext>;

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

    const { page, maxPage } = this.props;
    const { setSubtitle } = this.context;

    const p = (page + 1).toLocaleString();
    const mp = (maxPage + 1).toLocaleString();
    await setSubtitle(`file - ${p}/${mp} - ${file.name}`);
  }

  render()
  {
    const { loading, page, maxPage, prevPage, nextPage, query, parentPath } = this.props;
    const { file, tags, groups } = this.state;

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
      content = <div className='animate-fade-in spinner'/>;
    }

    return (
      <>
      <Hotkeys keyName='left,right,a,d' onKeyDown={this.onKeyDown}/>


      <div className={`h-full overflow-auto ${content ? 'bg-gray-900' : ''} scrollbar-light transition-colors`}>
        {content ?
        <div className='sticky top-0 flex justify-center place-items-center w-full h-screen-minus-titlebar'>
          {content}
        </div> : null}

        <div className={`w-full p-4 ${content ? 'pt-0' : ''}`}>

          <Card className='relative w-full space-y-4'>

            <QueryNav loading={loading} id={file?.id} page={page} maxPage={maxPage} prevPage={prevPage} nextPage={nextPage} backPath={parentPath}/>

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
                  </div> : null}
                </div>
              </CardSection>

              <CardSection className='bg-gray-100' headerIcon={faLayerGroup}>
                {groups.map((g, i) => {
                  const gq = new GroupSearchQuery({ id: g.id });
                  gq.limit = 1;
                  gq.parentInstanceID = query.instanceID;
                  // eslint-disable-next-line react/no-array-index-key
                  return  <Link key={i} to={`/${gq.route}/${g.id}?${gq.toString()}`}>{g.name}</Link>
                })}
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

export default withSearchQuery<IFileSearchQuery, FileStub, FileSearchQuery>(FileSearchQuery, { defaultPerPage: 1 })(FileView);
