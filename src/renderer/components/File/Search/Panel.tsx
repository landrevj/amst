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
  workspaceID?: number;
  files: FileStub[];
}

interface FileSearchPanelState
{
  tags: TagTuple[];
}

class FileSearchPanel extends React.Component<FileSearchPanelProps, FileSearchPanelState>
{
  constructor(props: FileSearchPanelProps)
  {
    super(props);

    this.state = {
      tags: [],
    }

    this.handleTagInputSubmit = this.handleTagInputSubmit.bind(this);
    this.handleTagRemove = this.handleTagRemove.bind(this);
    this.handleSearchButtonClick = this.handleSearchButtonClick.bind(this);
  }

  handleTagInputSubmit(tag: TagTuple)
  {
    const { tags } = this.state;
    if (!tags.find(e => e[0] === tag[0] && e[1] === tag[1]))
    {
      this.setState({
        tags: [...tags, tag],
      });
    }
  }

  handleTagRemove(index: number)
  {
    const { tags } = this.state;
    tags.splice(index, 1);
    this.setState({
      tags,
    });
  }

  handleSearchButtonClick()
  {
    const { workspaceID } = this.props;
    const { tags } = this.state;
    const query: FileSearchQuery = {
      workspaceID,
      tags,
    };
    const qs = QueryString.stringify(query);

    const { history } = this.props;
    history.push(`/file?${qs}`);
  }

  render()
  {
    const { tags } = this.state;

    return (
    <div className='h-full bg-gray-200'>
      <button type='button' onClick={this.handleSearchButtonClick}>search</button>
      <TagInput onSubmit={this.handleTagInputSubmit}/>
      <div className='flex flex-row flex-wrap'>
        {tags.map((tag, i) =>
          // eslint-disable-next-line react/no-array-index-key
          <TagButton tag={{ id: i, name: tag[0], category: tag[1], createdAt: new Date(), updatedAt: new Date() }} onRemove={this.handleTagRemove} key={i}/>  // this is gross
        )}
      </div>
    </div>
    );
  }
}

export default withRouter(FileSearchPanel);
