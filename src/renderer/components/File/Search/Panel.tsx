import React, { useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import QueryString from 'query-string';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

import { FileStub } from '../../../../db/entities';

import { TagTuple } from '../../Tag';
import TagButton from '../../Tag/Button';
import TagInput from '../../Tag/Input';
import { updateState } from '../../../../utils';
import FileSearchQuery, { IFileSearchQuery } from './Query';

interface FileSearchPanelProps extends RouteComponentProps
{
  query?: FileSearchQuery;
  files: FileStub[];
  resultCount?: number;
}

interface FileSearchPanelState extends IFileSearchQuery
{
  modifiedQuery: boolean;
}

class FileSearchPanel extends React.Component<FileSearchPanelProps, FileSearchPanelState>
{
  constructor(props: FileSearchPanelProps)
  {
    super(props);

    this.state = {
      name: '',
      extension: '',
      fullPath: '',
      mimeType: '',
      md5: '',
      andOr: 'and',
      modifiedQuery: false,
    };

    this.handleTagInputSubmit    = this.handleTagInputSubmit.bind(this);
    this.handleTagRemove         = this.handleTagRemove.bind(this);
    this.handleSearchButtonClick = this.handleSearchButtonClick.bind(this);
    this.handleToggleAndOr       = this.handleToggleAndOr.bind(this);
    this.handleStringInputChange = this.handleStringInputChange.bind(this);
  }

  componentDidMount()
  {
    const { query } = this.props;

    // look through the query and set state for each which isnt null
    if (query) Object.entries(query).forEach(e => {
      if (e[1]) this.setState(updateState(e[0] as keyof IFileSearchQuery, e[1]));
    });

  }

  async componentDidUpdate(prevProps: FileSearchPanelProps)
  {
    const { query } = this.props;

    if (prevProps.query !== query) this.setQuery(query);
  }

  handleTagInputSubmit(tag: TagTuple)
  {
    const { tags } = this.state;
    if (!tags?.find(e => e[0] === tag[0] && e[1] === tag[1]))
    {
      this.setState({
        tags: [...(tags || []), tag],
        modifiedQuery: true,
      });
    }
  }

  handleTagRemove(index: number)
  {
    const { tags } = this.state;
    tags?.splice(index, 1);
    this.setState({
      tags,
      modifiedQuery: true,
    });
  }

  handleSearchButtonClick()
  {
    const { query } = this.props;
    const { name, extension, fullPath, mimeType, md5, andOr, tags } = this.state;

    const newQuery = new FileSearchQuery(query?.props || {});
    Object.assign(newQuery, {
      name, extension, fullPath, mimeType, md5,
      tags,
      andOr,
      page: 0,
    });

    const { history } = this.props;
    history.push(`/file?${newQuery}`);
  }

  handleToggleAndOr()
  {
    const { andOr } = this.state;
    this.setState({
      andOr: andOr === 'and' ? 'or' : 'and',
    });
  }

  handleStringInputChange({ target: { name, value } }: React.ChangeEvent<HTMLInputElement>)
  {
    this.setState(prevState => ({
      ...updateState<string, FileSearchPanelState>(name as keyof IFileSearchQuery, value)(prevState),
      modifiedQuery: true,
    }));
  }

  setQuery(query: FileSearchQuery | undefined)
  {
    this.setState({
      ...query,
      modifiedQuery: false,
    });
  }

  render()
  {
    const { resultCount } = this.props;
    const { name, extension, fullPath, mimeType, md5, tags, andOr, modifiedQuery } = this.state;

    return (
      <div className='flex-none flex flex-col h-full w-64 bg-gray-200'>

        <div className='z-30 block relative mx-auto mt-3 px-2 py-1 text-sm rounded-full w-56 bg-gray-100 border-2 border-solid border-gray-300'>
          <TagInput className='inline-block w-44 ml-1 p-0 border-0 focus:ring-0 bg-transparent' onSubmit={this.handleTagInputSubmit} allowReservedCategoryPrefixes/>
          <button type='button' className='inline-block absolute inset-y-0 right-1 p-0 px-1 my-auto rounded-full bg-transparent text-gray-500 hover:text-blue-500' onClick={this.handleSearchButtonClick}>
            <FontAwesomeIcon className='fill-current' icon={faSearch}/>
          </button>
        </div>

        {tags?.length ?
        <div className='z-20 flex flex-row flex-wrap justify-center w-56 mx-auto -mt-4 p-2 pt-6 rounded-b-xl bg-gray-300'>
          {tags.map((tag, i) => {
            return <>
              { i === 0 ? <></> : <button type='button' className='text-xs focus:ring-0 focus:text-blue-400' onClick={this.handleToggleAndOr}>{andOr}</button>
              /* eslint-disable-next-line react/no-array-index-key */}
              <TagButton fontClassName='text-xs' tag={{ id: i, name: tag[0], category: tag[1], createdAt: '', updatedAt: '' }} onRemove={this.handleTagRemove} key={i}/>
            </>;
          })}
        </div> : <></>}

        <div className='z-10 w-56 mx-auto -mt-4 p-2 pt-6 space-y-2 rounded-b-xl bg-gray-400'>
          <input type='text' value={name}      name='name'      onChange={this.handleStringInputChange} className='inline-block w-full px-2 py-1 text-sm rounded-full border-2 border-solid border-gray-400 placeholder-opacity-75' placeholder='name'/>
          <input type='text' value={extension} name='extension' onChange={this.handleStringInputChange} className='inline-block w-full px-2 py-1 text-sm rounded-full border-2 border-solid border-gray-400 placeholder-opacity-75' placeholder='extension'/>
          <input type='text' value={fullPath}  name='fullPath'  onChange={this.handleStringInputChange} className='inline-block w-full px-2 py-1 text-sm rounded-full border-2 border-solid border-gray-400 placeholder-opacity-75' placeholder='path'/>
          <input type='text' value={mimeType}  name='mimeType'  onChange={this.handleStringInputChange} className='inline-block w-full px-2 py-1 text-sm rounded-full border-2 border-solid border-gray-400 placeholder-opacity-75' placeholder='mime type'/>
          <input type='text' value={md5}       name='md5'       onChange={this.handleStringInputChange} className='inline-block w-full px-2 py-1 text-sm rounded-full border-2 border-solid border-gray-400 placeholder-opacity-75' placeholder='md5'/>
        </div>

        {resultCount !== undefined ? <div className={`w-56 mx-auto -mt-4 px-1 py-0 pt-3.5 rounded-b-xl text-center ${modifiedQuery ? 'bg-yellow-300' : 'bg-blue-300 '}`}><span className='text-sm'>{modifiedQuery ? 'modified' : `${resultCount} results`}</span></div> : <></>}

      </div>
    );
  }
}

export default withRouter(FileSearchPanel);
