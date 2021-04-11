import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import QueryString from 'query-string';

import { FileStub } from '../../../../db/entities';

import { TagTuple } from '../../Tag';
import TagButton from '../../Tag/Button';
import TagInput from '../../Tag/Input';
import { FileSearchQuery } from '../index';

interface FileSearchPanelProps extends RouteComponentProps
{
  query?: FileSearchQuery;
  files: FileStub[];
}

type FileSearchPanelState = FileSearchQuery;

class FileSearchPanel extends React.Component<FileSearchPanelProps, FileSearchPanelState>
{
  constructor(props: FileSearchPanelProps)
  {
    super(props);

    this.state = {};

    this.handleTagInputSubmit = this.handleTagInputSubmit.bind(this);
    this.handleTagRemove = this.handleTagRemove.bind(this);
    this.handleSearchButtonClick = this.handleSearchButtonClick.bind(this);
  }

  componentDidMount()
  {
    const { query } = this.props;
    if (query?.tags) this.setState({ tags: query.tags });
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
      });
    }
  }

  handleTagRemove(index: number)
  {
    const { tags } = this.state;
    tags?.splice(index, 1);
    this.setState({
      tags,
    });
  }

  handleSearchButtonClick()
  {
    const { query } = this.props;
    const { tags } = this.state;
    const newQuery: FileSearchQuery = {
      ...query,
      tags,

      page: 0,
      limit: 20,
    };
    const qs = QueryString.stringify(newQuery);

    const { history } = this.props;
    history.push(`/file?${qs}`);
  }

  loadQuery(query: FileSearchQuery | undefined)
  {
    this.setState({ ...query });
  }

  render()
  {
    const { tags } = this.state;

    return (
    <div className='h-full bg-gray-200'>
      <button type='button' onClick={this.handleSearchButtonClick}>search</button>
      <TagInput className='mx-2 px-2 py-1 text-sm rounded-full w-52 bg-gray-100 border-2 border-solid border-gray-300' onSubmit={this.handleTagInputSubmit}/>
      <div className='flex flex-row flex-wrap'>
        {tags?.map((tag, i) =>
          // eslint-disable-next-line react/no-array-index-key
          <TagButton tag={{ id: i, name: tag[0], category: tag[1], createdAt: '', updatedAt: '' }} onRemove={this.handleTagRemove} key={i}/>
        )}
      </div>
    </div>
    );
  }
}

export default withRouter(FileSearchPanel);
