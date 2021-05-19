import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import AsyncSelect from 'react-select/async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faCheck, faUndo } from '@fortawesome/free-solid-svg-icons';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { FilterQuery } from '@mikro-orm/core';

import { GroupStub, Workspace, WorkspaceStub } from '../../../../db/entities';
import Client from '../../../../utils/websocket/SocketClient';

import { TagTuple } from '../../Tag';
import TagButton from '../../Tag/Button';
import TagInput from '../../Tag/Input';
import { updateState } from '../../../../utils';
import GroupSearchQuery, { IGroupSearchQuery } from './Query';
import { SocketRequestStatus } from '../../../../utils/websocket';
import { CardFooter, CardSection } from '../../UI/Card';

type OptionType = { value: string, label: string };

interface GroupSearchFormProps extends RouteComponentProps
{
  query?: GroupSearchQuery;
  groups: GroupStub[];
  resultCount?: number;
}

interface GroupSearchFormState extends IGroupSearchQuery
{
  workspaceSelectValue: OptionType;
  workspaceSelectOptions: OptionType[];
  modifiedQuery: boolean;
}

class GroupSearchForm extends React.Component<GroupSearchFormProps, GroupSearchFormState>
{
  constructor(props: GroupSearchFormProps)
  {
    super(props);

    this.state = {
      name: '',
      andOr: 'and',
      workspaceSelectValue: { value: '', label: 'Loading...' },
      workspaceSelectOptions: [],
      modifiedQuery: false,
    };

    this.handleTagInputSubmit        = this.handleTagInputSubmit.bind(this);
    this.handleTagRemove             = this.handleTagRemove.bind(this);
    this.handleSearchButtonClick     = this.handleSearchButtonClick.bind(this);
    this.handleClearForm             = this.handleClearForm.bind(this);
    this.handleToggleAndOr           = this.handleToggleAndOr.bind(this);
    this.handleStringInputChange     = this.handleStringInputChange.bind(this);
    this.handleLoadWorkspaceSelect   = this.handleLoadWorkspaceSelect.bind(this);
    this.handleWorkspaceSelectChange = this.handleWorkspaceSelectChange.bind(this);
  }

  componentDidMount()
  {
    const { query } = this.props;

    // look through the query and set state for each which isnt null
    if (query) Object.entries(query).forEach(e => {
      if (e[1]) this.setState(updateState(e[0] as keyof IGroupSearchQuery, e[1]));
    });
  }

  async componentDidUpdate(prevProps: GroupSearchFormProps, prevState: GroupSearchFormState)
  {
    const { query } = this.props;

    if (prevProps.query !== query) this.setQuery(query);

    const { workspaceID, workspaceSelectOptions } = this.state;

    // setting value for initial load of workspace select options. dont need to run this otherwise.
    if (prevState.workspaceSelectValue.value === '' && prevState.workspaceSelectOptions !== workspaceSelectOptions)
    {
      const thisWorkspace = workspaceSelectOptions.find(o => o.value === workspaceID?.toString());
      if (thisWorkspace) this.setWorkspaceSelectValue(thisWorkspace);
    }
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
    const { name, andOr, tags, workspaceID } = this.state;

    const newQuery = new GroupSearchQuery(query?.props || {});
    Object.assign(newQuery, {
      name,
      tags,
      andOr,
      workspaceID,
      page: 0,
    });

    const { history } = this.props;
    history.push(`/group?${newQuery}`);
  }

  handleClearForm()
  {
    this.setState({
      name: '',
      tags: undefined,
      andOr: 'and',
      modifiedQuery: true,
    });
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
      ...updateState<string, GroupSearchFormState>(name as keyof IGroupSearchQuery, value)(prevState),
      modifiedQuery: true,
    }));
  }

  async handleLoadWorkspaceSelect(input: string)
  {
    const query: FilterQuery<Workspace> = { name: { $like: `%%${input}%%` } };
    const response = await Client.send<WorkspaceStub[]>('Workspace', { action: 'read', params: [input.length ? query : {}] });
    const success = response.status === SocketRequestStatus.SUCCESS;

    if (!success || !response.data) return [{ label: 'DB query failed!', value: 'null' }] as OptionType[];

    const options: OptionType[] = response.data.map(w => ({ label: w.name, value: w.id.toString() }));

    this.setState({
      workspaceSelectOptions: options,
    });
    return options;
  }

  handleWorkspaceSelectChange(option: OptionType | null)
  {
    if (!option) return;

    this.setWorkspaceSelectValue(option, true);
  }

  setWorkspaceSelectValue(option: OptionType, changedWorkspace?: boolean)
  {
    if (changedWorkspace)
    {
      this.setState({
        workspaceID: parseInt(option.value, 10),
        workspaceSelectValue: option,
        modifiedQuery: true,
      });
    }
    else
    {
      this.setState({
        workspaceSelectValue: option,
      });
    }
  }

  setQuery(query: GroupSearchQuery | undefined)
  {
    this.setState({
      ...query?.props,
      modifiedQuery: false,
    });
  }

  render()
  {
    const { resultCount, query } = this.props;
    const { name, tags, andOr, workspaceSelectValue, modifiedQuery } = this.state;

    return (
      <>
        <CardSection fullWidth>
          <AsyncSelect<OptionType> cacheOptions defaultOptions loadOptions={this.handleLoadWorkspaceSelect} value={workspaceSelectValue} onChange={this.handleWorkspaceSelectChange} className='react-select_container' classNamePrefix='react-select'/>
        </CardSection>

        <CardSection fullWidth className='p-4 bg-gray-100 space-y-4'>
          <TagInput className='inline-block w-full px-2 py-1 text-sm rounded-full border-2 border-solid border-gray-300 placeholder-gray-400' onSubmit={this.handleTagInputSubmit} allowReservedCategoryPrefixes/>

          <div className='p-2 flex flex-row flex-wrap justify-center bg-white rounded-lg border-solid border-gray-200 border-2'>
          {tags?.length ?
            tags.map((tag, i) =>
            /* eslint-disable-next-line react/no-array-index-key */
            <div className='max-w-full flex flex-row' key={i}>
              {i === 0 ? <></> : <button type='button' className='bg-transparent text-xs focus:ring-0 focus:text-blue-400' onClick={this.handleToggleAndOr}>{andOr === 'and' ? '&' : '|'}</button>
              /* eslint-disable-next-line react/no-array-index-key */}
              <TagButton fontClassName='text-xs' tag={{ id: i, name: tag[0], category: tag[1], createdAt: '', updatedAt: '' }} onRemove={this.handleTagRemove}/>
            </div>
            )
          : <span><FontAwesomeIcon className='text-gray-300' icon={faBan}/></span>}
          </div>
        </CardSection>

        <CardSection fullWidth className='p-4 space-y-2 bg-gray-200'>
          <input type='text' value={name}      name='name'      onChange={this.handleStringInputChange} className='inline-block w-full px-2 py-1 text-sm rounded-full border-2 border-solid border-gray-300 placeholder-gray-400' placeholder='name'/>
        </CardSection>

        {resultCount !== undefined ?
        <div className={`-mx-4 text-center filter saturate-[.9] ${modifiedQuery ? 'bg-gradient-to-r from-yellow-400 to-yellow-300' : 'bg-gradient-to-r from-blue-400 to-blue-300'}`}>
          <span className='text-sm text-white'>{modifiedQuery ? 'modified' : `${resultCount.toLocaleString()} results`}</span>
        </div> : <></>}

        <CardFooter buttons>
          <button type="button" className='hover:text-red-400' onClick={this.handleClearForm}>
            <FontAwesomeIcon icon={faTrashAlt}/>
          </button>
          <button type="button" className='hover:text-yellow-400' onClick={() => this.setQuery(query)}>
            <FontAwesomeIcon icon={faUndo}/>
          </button>
          <button type="button" className='hover:text-green-400' onClick={this.handleSearchButtonClick}>
            <FontAwesomeIcon icon={faCheck}/>
          </button>
        </CardFooter>


      </>
    );
  }
}

export default withRouter(GroupSearchForm);
