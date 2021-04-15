/* eslint-disable react/jsx-props-no-spreading */
// "When Not To Use It: ...or the props spreading is used inside HOC."

import { useState, useEffect, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import QueryString from 'query-string';
import log from 'electron-log';

import Client from '../../../utils/websocket/SocketClient';
import { SocketRequestStatus } from '../../../utils/websocket';

import { FileSearchQuery } from '.';
import { FileStub } from '../../../db/entities';
import { TagTuple } from '../Tag';

const DEFAULT_FILES_PER_PAGE = 20;

export function loadQuery(search: string, defaultFilesPerPage?: number): FileSearchQuery
{
  // console.log(search);
  const qs = QueryString.parse(search);

  // query-string properties are of type string | string[] | null
  // this helper basically just narrows type and applies a function appropriately
  // can ask for the result to return as the first element in an array if 'thing' was a singular string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const helper = (thing: string | string[] | null, fn: (e: string) => any, returnArray?: boolean) => {
    if (Array.isArray(thing))       return thing.map(fn);
    if (typeof thing === 'string')  return returnArray ? [fn(thing)] : fn(thing);

    return thing;
  };

  const newQuery: FileSearchQuery = {
    workspaceID: helper(qs.workspaceID, id => parseInt(id, 10)),
    tags: helper(qs.tags, t => {
      const s = t.split(',');
      const tag: TagTuple = [s[0], s[1]];
      return tag;
    }, true),
    page: helper(qs.page, p => parseInt(p, 10)) || 0,
    limit: helper(qs.limit, l => parseInt(l, 10)) || defaultFilesPerPage || DEFAULT_FILES_PER_PAGE,
  }

  return newQuery;
}

export interface Options
{
  // how many files appear in one page of a search
  defaultFilesPerPage?: number,
}

export interface LocationState
{
  parentQuery: FileSearchQuery;
}

export default function useFileSearchQuery(options: Readonly<Options>): [FileStub[], number, number, number, () => void, () => void, (p: number) => void, FileSearchQuery, FileSearchQuery | undefined]
{
  const location = useLocation<LocationState | undefined>();
  const [parentQuery] = useState<FileSearchQuery | undefined>(location.state?.parentQuery);

  const [files,   setFiles]   = useState<FileStub[]>([]);
  const [count,   setCount]   = useState(0);
  const [page,    setPage]    = useState(0);
  const [maxPage, setMaxPage] = useState(0);
  // console.log(location);

  const query = useMemo(() => loadQuery(location.search, options.defaultFilesPerPage), [location.search, options.defaultFilesPerPage]);

  useEffect(() => {
    async function loadFiles()
    {
      const fileResponse = await Client.send<{ files: FileStub[], count: number | undefined }>('File', { action: 'search', params: query });
      const fileSuccess  = fileResponse.status === SocketRequestStatus.SUCCESS;
      if (!(fileSuccess && fileResponse.data))
      {
        log.error(`Failed to get files for workspace with given id: ${query.workspaceID}`);
        return;
      };

      const { data } = fileResponse;
      const newFiles = data.files;
      const newCount = data.count;

      setFiles(newFiles);
      setCount(newCount || 0);
      setPage(query.page || 0);
      // compute the length of the 'search results array' and then subtract one to get the largest index
      setMaxPage(Math.ceil((newCount || 0) / (query.limit || options.defaultFilesPerPage || DEFAULT_FILES_PER_PAGE)) - 1);
    }
    loadFiles();
  }, [query, options.defaultFilesPerPage]);


  const history = useHistory();
  const prevPage = () => {
    if (page <= 0) return;

    const pqs = QueryString.stringify({ ...query, page: page - 1 });
    history.push(`${location.pathname}?${pqs}`);
  };
  const nextPage = () => {
    if (page >= maxPage) return;

    const nqs = QueryString.stringify({ ...query, page: page + 1 });
    history.push(`${location.pathname}?${nqs}`);
  };
  const goToPage = (p: number) => {
    const sqs = QueryString.stringify({ ...query, page: p });
    history.push(`${location.pathname}?${sqs}`);
  };

  return [files, count, page, maxPage, prevPage, nextPage, goToPage, query, parentQuery];
}
