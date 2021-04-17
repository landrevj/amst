import QueryString from 'query-string';
import { TagTuple } from '../../../Tag';

export interface IFileSearchQuery
{
  // property queries
  name?: string;
  extension?: string;
  fullPath?: string;
  mimeType?: string;
  md5?: string;

  // join queries
  workspaceID?: number;
  tags?: TagTuple[];
  andOr?: 'and' | 'or',

  // pagination
  limit?: number;
  page?: number;
}

// when we stringify it we want to be able to load the old query in one go,
// then set the tags to a JSON.stringified version rather than the TagTuple[] in the original type
type IFileSearchQueryStringified = Omit<IFileSearchQuery, 'tags'> & { tags?: string };

export default class FileSearchQuery implements IFileSearchQuery
{
  static DEFAULT_FILES_PER_PAGE = 20;

  // property queries
  public name?: string;
  public extension?: string;
  public fullPath?: string;
  public mimeType?: string;
  public md5?: string;

  // join queries
  public workspaceID?: number;
  public tags?: TagTuple[];
  public andOr?: 'and' | 'or';

  // pagination
  public limit?: number;
  public page?: number;

  constructor(query: IFileSearchQuery);
  constructor(query: string, defaultFilesPerPage?: number);
  constructor(query: IFileSearchQuery | string, defaultFilesPerPage: number = FileSearchQuery.DEFAULT_FILES_PER_PAGE)
  {
    if (typeof query === 'string') this.loadQuery(query, defaultFilesPerPage);
    else Object.assign(this, query);
  }

  public loadQuery(search: string, defaultFilesPerPage?: number): FileSearchQuery
  {
    const qs = QueryString.parse(search);

    // query-string properties are of type string | string[] | null
    // this helper basically just narrows type and applies a function appropriately
    // can ask for the result to return as the first element in an array if 'thing' was a singular string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const helper = (thing: string | string[] | null, fn?: (e: string) => any, returnArray?: boolean) => {
      if (Array.isArray(thing) && fn)       return thing.map(fn);
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

    // these need to be parsed from strings
    this.workspaceID = helper(qs.workspaceID, id => parseInt(id, 10));
    // we dont trust query-string to stringify this properly so we move it around as as a string with JSON.stringify
    this.tags = qs.tags && JSON.parse(qs.tags as string);
    this.andOr = qs.andOr && qs.andOr === 'or' ? 'or' : 'and';

    // these need to be parsed and have defaults
    this.page =  helper(qs.page, p => parseInt(p, 10)) || 0;
    this.limit = helper(qs.limit, l => parseInt(l, 10)) || defaultFilesPerPage || FileSearchQuery.DEFAULT_FILES_PER_PAGE;

    return this;
  }

  public toString(): string
  {
    // query-string doesnt handle stringifying nested arrays properly so we just use JSON.stringify instead
    // then parse it back above in loadQuery. makes the links a bit ugly but it works
    const t = { ...(this as IFileSearchQueryStringified) };
    if (this.tags && this.tags.length) t.tags = JSON.stringify(this.tags);
    const qs = QueryString.stringify(t);
    return qs;
  }

  get props(): IFileSearchQuery
  {
    return this as IFileSearchQuery;
  }
}
