import log from 'electron-log';
import QueryString from 'query-string';
import { QueryOrder } from '@mikro-orm/core';

import Client from '../../../../shared/websocket/SocketClient';
import { SocketRequestStatus } from '../../../../shared/websocket';
import { GroupStub } from '../../../../db/entities';
import { TagTuple } from '../../Tag';
import { SearchQuery, ISearchQuery } from '../../UI/Search/Query';

export interface IGroupSearchQuery extends ISearchQuery
{
  // property queries
  name?: string;

  // join queries
  workspaceID?: number;
  tags?: TagTuple[];
  andOr?: 'AND' | 'OR',
}

// when we stringify it we want to be able to load the old query in one go,
// then set the tags to a JSON.stringified version rather than the TagTuple[] in the original type
type IGroupSearchQueryStringified = Omit<IGroupSearchQuery, 'tags'> & { tags?: string };

export default class GroupSearchQuery extends SearchQuery<IGroupSearchQuery, GroupStub> implements IGroupSearchQuery
{
  static DEFAULT_GROUPS_PER_PAGE = 20;
  public readonly route = 'group';

  // property queries
  public name?: string;

  // join queries
  public workspaceID?: number;
  public tags?: TagTuple[];
  public andOr?: 'AND' | 'OR';

  constructor(query: IGroupSearchQuery | string, overrideInstanceID = false, defaultFilesPerPage?: number)
  {
    super();
    this.loadQuery(query, overrideInstanceID, defaultFilesPerPage);
  }

  public loadQuery(search: IGroupSearchQuery | string, overrideInstanceID = false, defaultFilesPerPage?: number): GroupSearchQuery
  {
    if (typeof search !== 'string')
    {
      if (!overrideInstanceID)
      {
        const thisID = this.instanceID;
        const s = { ... search };
        delete s.instanceID;
        Object.assign(this, s);
        this.instanceID = thisID;
      }
      else
      {
        Object.assign(this, search);
      }

      this.parentInstanceID = search.parentInstanceID;
      return this;
    }

    const qs = QueryString.parse(search);

    // query-string properties are of type string | string[] | null
    // this helper basically just narrows type and applies a function appropriately
    // can ask for the result to return as the first element in an array if 'thing' was a singular string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const helper = (thing: string | string[] | null, fn?: (e: string) => any, returnArray?: boolean) => {
      if (Array.isArray(thing) && fn) return thing.map(fn);
      if (typeof thing === 'string')
      {
        if (fn) return returnArray ? [fn(thing)] : fn(thing);

        return thing;
      }

      return thing;
    };

    this.name  = qs.name  ? qs.name  as string : '';
    this.order = qs.order ? qs.order as QueryOrder : QueryOrder.ASC;

    // these need to be parsed from strings
    this.workspaceID = helper(qs.workspaceID, id => parseInt(id, 10));
    // we dont trust query-string to stringify this properly so we move it around as as a string with JSON.stringify
    this.tags = qs.tags && JSON.parse(qs.tags as string);
    this.andOr = qs.andOr && qs.andOr === 'OR' ? 'OR' : 'AND';

    // these need to be parsed and have defaults
    this.page =  helper(qs.page, p => parseInt(p, 10)) || 0;
    this.limit = helper(qs.limit, l => parseInt(l, 10)) || defaultFilesPerPage || GroupSearchQuery.DEFAULT_GROUPS_PER_PAGE;

    this.instanceID = overrideInstanceID && qs.instanceID ? qs.instanceID as string : this.instanceID;
    this.parentInstanceID = qs.parentInstanceID ? qs.parentInstanceID as string : '';

    return this;
  }

  public async getResults()
  {
    const response = await Client.send<{ groups: GroupStub[], count: number | undefined }>('Group', { action: 'search', params: this.props });
    const success  = response.status === SocketRequestStatus.SUCCESS;
    if (!(success && response.data))
    {
      log.error(`Failed to get files for workspace with given id: ${this.workspaceID}`);
      return [[], undefined] as [GroupStub[], number | undefined];
    };

    const { data } = response;
    const newGroups = data.groups;
    const newCount = data.count;

    return [newGroups, newCount] as [GroupStub[], number | undefined];
  }

  public toString(): string
  {
    // query-string doesnt handle stringifying nested arrays properly so we just use JSON.stringify instead
    // then parse it back above in loadQuery. makes the links a bit ugly but it works
    const t = { ...(this as IGroupSearchQueryStringified) };
    if (this.tags?.length) t.tags = JSON.stringify(this.tags);
    const qs = QueryString.stringify(t);
    return qs;
  }

  get props(): IGroupSearchQuery
  {
    return this as IGroupSearchQuery;
  }
}
