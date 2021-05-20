import log from 'electron-log';
import QueryString from 'query-string';
import { QueryOrder } from '@mikro-orm/core';

import Client from '../../../../utils/websocket/SocketClient';
import { SocketRequestStatus } from '../../../../utils/websocket';
import { FileStub } from '../../../../db/entities';
import { TagTuple } from '../../Tag';
import { SearchQuery, ISearchQuery } from '../../UI/Search/Query';

export interface IFileSearchQuery extends ISearchQuery
{
  // property queries
  name?: string;
  extension?: string;
  fullPath?: string;
  mimeType?: string;
  md5?: string;

  // join queries
  workspaceID?: number;
  groupID?: number;
  tags?: TagTuple[];
  andOr?: 'AND' | 'OR',
}

// when we stringify it we want to be able to load the old query in one go,
// then set the tags to a JSON.stringified version rather than the TagTuple[] in the original type
type IFileSearchQueryStringified = Omit<IFileSearchQuery, 'tags'> & { tags?: string };

export default class FileSearchQuery extends SearchQuery<IFileSearchQuery, FileStub> implements IFileSearchQuery
{
  static DEFAULT_FILES_PER_PAGE = 20;
  public readonly route = 'file';

  // property queries
  public name?: string;
  public extension?: string;
  public fullPath?: string;
  public mimeType?: string;
  public md5?: string;

  // join queries
  public workspaceID?: number;
  public groupID?: number;
  public tags?: TagTuple[];
  public andOr?: 'AND' | 'OR';

  // constructor(query: IFileSearchQuery);
  // constructor(query: string, defaultFilesPerPage?: number);
  constructor(query: IFileSearchQuery | string, defaultFilesPerPage?: number)
  {
    super();
    this.loadQuery(query, defaultFilesPerPage);
  }

  public loadQuery(search: IFileSearchQuery | string, defaultFilesPerPage?: number): FileSearchQuery
  {
    if (typeof search !== 'string')
    {
      Object.assign(this, search);
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

    // these are always strings so just cast them
    this.name      = qs.name      ? qs.name      as string : '';
    this.extension = qs.extension ? qs.extension as string : '';
    this.fullPath  = qs.fullPath  ? qs.fullPath  as string : '';
    this.mimeType  = qs.mimeType  ? qs.mimeType  as string : '';
    this.md5       = qs.md5       ? qs.md5       as string : '';
    this.order     = qs.order     ? qs.order     as QueryOrder : QueryOrder.ASC;

    // these need to be parsed from strings
    this.workspaceID = helper(qs.workspaceID, id => parseInt(id, 10));
    this.groupID = helper(qs.groupID, id => parseInt(id, 10));
    // we dont trust query-string to stringify this properly so we move it around as as a string with JSON.stringify
    this.tags = qs.tags && JSON.parse(qs.tags as string);
    this.andOr = qs.andOr && qs.andOr === 'OR' ? 'OR' : 'AND';

    // these need to be parsed and have defaults
    this.page =  helper(qs.page, p => parseInt(p, 10)) || 0;
    this.limit = helper(qs.limit, l => parseInt(l, 10)) || defaultFilesPerPage || FileSearchQuery.DEFAULT_FILES_PER_PAGE;

    return this;
  }

  public async getResults()
  {
    const fileResponse = await Client.send<{ files: FileStub[], count: number | undefined }>('File', { action: 'search', params: this.props });
    const fileSuccess  = fileResponse.status === SocketRequestStatus.SUCCESS;
    if (!(fileSuccess && fileResponse.data))
    {
      log.error(`Failed to get files for workspace with given id: ${this.workspaceID}`);
      return [[], undefined] as [FileStub[], number | undefined];
    };

    const { data } = fileResponse;
    const newFiles = data.files;
    const newCount = data.count;

    return [newFiles, newCount] as [FileStub[], number | undefined];
  }

  public toString(): string
  {
    // query-string doesnt handle stringifying nested arrays properly so we just use JSON.stringify instead
    // then parse it back above in loadQuery. makes the links a bit ugly but it works
    const t = { ...(this as IFileSearchQueryStringified) };
    if (this.tags?.length) t.tags = JSON.stringify(this.tags);
    const qs = QueryString.stringify(t);
    return qs;
  }

  get props(): IFileSearchQuery
  {
    return this as IFileSearchQuery;
  }
}
