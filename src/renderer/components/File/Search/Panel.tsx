import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import QueryString from 'query-string';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

import { FileStub } from '../../../../db/entities';

import { TagTuple } from '../../Tag';
import TagButton from '../../Tag/Button';
import TagInput from '../../Tag/Input';
import { FileSearchQuery } from '../index';
import { updateState } from '../../../../utils';

interface FileSearchPanelProps extends RouteComponentProps
{
  query?: FileSearchQuery;
  files: FileStub[];
  resultCount?: number;
}

interface FileSearchPanelState extends FileSearchQuery
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
      modifiedQuery: false,
    };

    this.handleTagInputSubmit    = this.handleTagInputSubmit.bind(this);
    this.handleTagRemove         = this.handleTagRemove.bind(this);
    this.handleSearchButtonClick = this.handleSearchButtonClick.bind(this);

    this.handleNameInputChange      = this.handleNameInputChange.bind(this);
    this.handleExtensionInputChange = this.handleExtensionInputChange.bind(this);
    this.handleFullPathInputChange  = this.handleFullPathInputChange.bind(this);
    this.handleMimeTypeInputChange  = this.handleMimeTypeInputChange.bind(this);
    this.handleMD5InputChange       = this.handleMD5InputChange.bind(this);
  }

  componentDidMount()
  {
    const { query } = this.props;

    // look through the query and set state for each which isnt null
    if (query) Object.entries(query).forEach(e => {
      if (e[1]) this.setState(updateState(e[0] as keyof FileSearchQuery, e[1]));
    });

  }

  async componentDidUpdate(prevProps: FileSearchPanelProps)
  {
    const { query } = this.props;

    if (prevProps.query !== query) this.loadQuery(query);
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
    const { name, extension, fullPath, mimeType, md5, tags } = this.state;

    const newQuery: FileSearchQuery = {
      ...query,
      name, extension, fullPath, mimeType, md5,

      tags,

      page: 0,
    };
    const qs = QueryString.stringify(newQuery);
    console.log(qs);
    const { history } = this.props;
    history.push(`/file?${qs}`);
  }

  handleNameInputChange({ target: { value } }: React.ChangeEvent<HTMLInputElement>)
  {
    this.setState({
      name: value,
      modifiedQuery: true,
    });
  }

  handleExtensionInputChange({ target: { value } }: React.ChangeEvent<HTMLInputElement>)
  {
    this.setState({
      extension: value,
      modifiedQuery: true,
    });
  }

  handleFullPathInputChange({ target: { value } }: React.ChangeEvent<HTMLInputElement>)
  {
    this.setState({
      fullPath: value,
      modifiedQuery: true,
    });
  }

  handleMimeTypeInputChange({ target: { value } }: React.ChangeEvent<HTMLInputElement>)
  {
    this.setState({
      mimeType: value,
      modifiedQuery: true,
    });
  }

  handleMD5InputChange({ target: { value } }: React.ChangeEvent<HTMLInputElement>)
  {
    this.setState({
      md5: value,
      modifiedQuery: true,
    });
  }

  loadQuery(query: FileSearchQuery | undefined)
  {
    this.setState({
      ...query,
      modifiedQuery: false,
    });
  }

  render()
  {
    const { resultCount } = this.props;
    const { name, extension, fullPath, mimeType, md5, tags, modifiedQuery } = this.state;

    // some flexbox strangeness to get things to get things to stack on top of eachother correctly
    // we basically want the z-index order reversed from normal so things at the bottom will be under those above them,
    // instead of the other way around. to do this we declare them in order we want them to stack, last to first - bottom to top,
    // then reverse the order with flex so they appear in the correct order

    // all that is to say all children of the top level div are rendered in reverse order so just remember to put them in that way
    return (
      <div className='flex-none flex flex-col-reverse justify-end h-full w-64 bg-gray-200'>

        {resultCount !== undefined ? <div className={`w-56 mx-auto -mt-4 px-1 py-0 pt-3.5 rounded-b-xl text-center ${modifiedQuery ? 'bg-yellow-300' : 'bg-blue-300 '}`}><span className='text-sm'>{modifiedQuery ? 'modified' : `${resultCount} results`}</span></div> : <></>}

        <div className='w-56 mx-auto -mt-4 p-2 pt-6 space-y-2 rounded-b-xl bg-gray-400'>
          <input type='text' value={name}      onChange={this.handleNameInputChange}      className='inline-block w-full px-2 py-1 text-sm rounded-full border-2 border-solid border-gray-400 placeholder-opacity-75' placeholder='name'/>
          <input type='text' value={extension} onChange={this.handleExtensionInputChange} className='inline-block w-full px-2 py-1 text-sm rounded-full border-2 border-solid border-gray-400 placeholder-opacity-75' placeholder='extension'/>
          <input type='text' value={fullPath}  onChange={this.handleFullPathInputChange}  className='inline-block w-full px-2 py-1 text-sm rounded-full border-2 border-solid border-gray-400 placeholder-opacity-75' placeholder='path'/>
          <input type='text' value={mimeType}  onChange={this.handleMimeTypeInputChange}  className='inline-block w-full px-2 py-1 text-sm rounded-full border-2 border-solid border-gray-400 placeholder-opacity-75' placeholder='mime type'/>
          <input type='text' value={md5}       onChange={this.handleMD5InputChange}       className='inline-block w-full px-2 py-1 text-sm rounded-full border-2 border-solid border-gray-400 placeholder-opacity-75' placeholder='md5'/>
        </div>

        {tags?.length ?
        <div className='flex flex-row flex-wrap justify-center w-56 mx-auto -mt-4 p-2 pt-6 rounded-b-xl bg-gray-300'>
          {tags.map((tag, i) =>
            // eslint-disable-next-line react/no-array-index-key
            <TagButton fontClassName='text-xs' tag={{ id: i, name: tag[0], category: tag[1], createdAt: '', updatedAt: '' }} onRemove={this.handleTagRemove} key={i}/>
          )}
        </div> : <></>}

        <div className='block relative mx-auto mt-3 px-2 py-1 text-sm rounded-full w-56 bg-gray-100 border-2 border-solid border-gray-300'>
          <TagInput className='inline-block w-44 ml-1 p-0 border-0 focus:ring-0 bg-transparent' onSubmit={this.handleTagInputSubmit} allowReservedCategoryPrefixes/>
          <button type='button' className='inline-block absolute inset-y-0 right-1 p-0 px-1 my-auto bg-transparent text-gray-500 hover:text-blue-500 focus:outline-none focus:text-blue-500' onClick={this.handleSearchButtonClick}>
            <FontAwesomeIcon className='fill-current' icon={faSearch}/>
          </button>
        </div>

      </div>
    );
  }
}

export default withRouter(FileSearchPanel);
