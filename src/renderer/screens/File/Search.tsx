import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import QueryString from 'query-string';
import { FilterQuery, FindOptions, QueryOrder } from '@mikro-orm/core';
import log from 'electron-log';

import Client from '../../../utils/websocket/SocketClient';
import { FileStub, File } from '../../../db/entities';
import FilePreviewList from '../../components/File/Preview/List';

import { SocketRequestStatus } from '../../../utils/websocket';
import FileSearchPanel from '../../components/File/Search/Panel';
import { FileSearchQuery } from '../../components/File';
import { TagTuple } from '../../components/Tag';

interface FileSearchState
{
  query: FileSearchQuery;
  files: FileStub[];
}

// eslint-disable-next-line import/prefer-default-export
export class FileSearch extends React.Component<RouteComponentProps, FileSearchState>
{
  static buildDBQuery(query: FileSearchQuery): [FilterQuery<File>, FindOptions<File>]
  {
    const where: FilterQuery<File> = { $and: [], };

    if (query.workspaceID) where.$and?.push({ workspaces: { id: query.workspaceID } });
    // if (query.tags)
    // {
    //   const tq: FilterQuery<File> = { $or: [] };
    //   query.tags.forEach(tag => {
    //     if (tag[1]) tq.$or?.push({ tags: { name: tag[0], category: tag[1] } });
    //     else        tq.$or?.push({ tags: { name: tag[0] } });
    //   });
    //   where.$and?.push(tq);
    // }


    const itemsPerPage = 20;
    const options: FindOptions<File> = {
      orderBy: { id: QueryOrder.DESC },
      limit: itemsPerPage,
      offset: (query.page || 0) * itemsPerPage,
      // groupBy: 'id',
      // having: { $and: [{ tags: { name: 'one', category: 'tag' } }, { tags: { name: 'two', category: 'tag' } }] }
    }
    console.log(where, options);

    return [where, options];
  }

  constructor(props: RouteComponentProps)
  {
    super(props);

    this.state = {
      query: {},
      files: [],
    }
  }

  componentDidMount()
  {
    this.loadSearch();
  }

  async componentDidUpdate(prevProps: RouteComponentProps, prevState: FileSearchState)
  {
    const { query } = this.state;

    // i assume this isnt doing a deep comparison between the object's properties,
    // just that they arent 'at the same address' or whatever the JS eqivalent is.
    // wont work if the properties of the query are changed, only when the query itself is swapped out
    // which is what happens when we load the search so w/e
    if (prevState.query !== query) this.loadFiles();

    const { location: { search } } = this.props;
    if (prevProps.location.search !== search)
    {
      this.loadSearch();
    }
  }

  async loadSearch()
  {
    const { location: { search } } = this.props;
    const qs = QueryString.parse(search);

    const helper = (thing: string | string[] | null, fn: (e: string) => any, returnArray?: boolean) => {
      if (Array.isArray(thing))       return thing.map(fn);
      if (typeof thing === 'string')  return returnArray ? [fn(thing)] : fn(thing);

      return thing;
    };

    const query: FileSearchQuery = {
      workspaceID: helper(qs.workspaceID, id => parseInt(id, 10)),
      page: helper(qs.page, p => parseInt(p, 10)) || 0,
      tags: helper(qs.tags, t => {
        const s = t.split(',');
        const tag: TagTuple = [s[0], s[1] === '' ? undefined : s[1]]
        return tag;
      }, true),
    }
    console.log('aqs', query);

    this.setState({
      query,
    });
  }

  async loadFiles()
  {
    const { query } = this.state;
    const q = FileSearch.buildDBQuery(query);

    const fileResponse = await Client.send<FileStub[]>('File', { action: 'read', params: q });
    const fileSuccess  = fileResponse.status === SocketRequestStatus.SUCCESS;
    if (!(fileSuccess && fileResponse.data))
    {
      log.error(`Failed to get files for workspace with given id: ${query.workspaceID}`);
      return;
    };

    const files = fileResponse.data;
    this.setState({
      files,
    });
  }

  render()
  {
    const { files, query } = this.state;
    const page = query.page || 0;

    const prevPageLink = page > 0 ? (<Link className='px-2 py-1 bg-blue-100 rounded' to={`/file?workspaceID=${query.workspaceID}&page=${page - 1}`}>prev</Link>) : (<span className='px-2 py-1 bg-gray-200 rounded'>prev</span>);
    const nextPageLink = (<Link className='px-2 py-1 bg-blue-200 rounded' to={`/file?workspaceID=${query.workspaceID}&page=${page + 1}`}>next</Link>);

    return (
      <div className='flex flex-row h-screen'>
        <FileSearchPanel workspaceID={query.workspaceID} files={files}/>
        <div className='flex-grow h-full overflow-y-auto'>
          <Link to='/'>Home</Link>
          <div className='space-x-1.5 p-4'>
            <span>Page {page}</span>
            {prevPageLink}
            {nextPageLink}
          </div>
          <FilePreviewList files={files} />
        </div>
      </div>
    );
  }

};
