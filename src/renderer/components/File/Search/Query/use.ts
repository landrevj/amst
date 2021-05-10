/* eslint-disable react/jsx-props-no-spreading */
// "When Not To Use It: ...or the props spreading is used inside HOC."

import { useState, useEffect, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import log from 'electron-log';

import Client from '../../../../../utils/websocket/SocketClient';
import { SocketRequestStatus } from '../../../../../utils/websocket';

import { FileStub } from '../../../../../db/entities';
import FileSearchQuery from './Query';
import { PARENT_FILE_SEARCH_QUERY } from '../../../../SessionStorageKeys';

export interface Options
{
  // how many files appear in one page of a search
  defaultFilesPerPage?: number,
}

export default function useFileSearchQuery(options: Readonly<Options>): [FileStub[], number, number, number, () => void, () => void, (p: number) => void, FileSearchQuery, FileSearchQuery | undefined, (fsq: FileSearchQuery) => void]
{
  const location = useLocation();

  const sessionQueryString = window.sessionStorage.getItem(PARENT_FILE_SEARCH_QUERY);
  const [parentQuery] = useState<FileSearchQuery | undefined>(sessionQueryString ? new FileSearchQuery(JSON.parse(sessionQueryString)) : undefined);

  const [files,   setFiles]   = useState<FileStub[]>([]);
  const [count,   setCount]   = useState(0);
  const [page,    setPage]    = useState(0);
  const [maxPage, setMaxPage] = useState(0);

  const query = useMemo(() => new FileSearchQuery(location.search, options.defaultFilesPerPage), [location.search, options.defaultFilesPerPage]);

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
      setMaxPage(Math.ceil((newCount || 0) / (query.limit || options.defaultFilesPerPage || FileSearchQuery.DEFAULT_FILES_PER_PAGE)) - 1);
    }
    loadFiles();
  }, [query, options.defaultFilesPerPage]);


  const history = useHistory();
  const prevPage = () => {
    if (page <= 0) return;

    const pqs = new FileSearchQuery(query.props);
    pqs.page = page - 1;
    history.push(`${location.pathname}?${pqs}`);
  };
  const nextPage = () => {
    if (page >= maxPage) return;

    const nqs = new FileSearchQuery(query.props);
    nqs.page = page + 1;
    history.push(`${location.pathname}?${nqs}`);
  };
  const goToPage = (p: number) => {
    const sqs = new FileSearchQuery(query.props);
    sqs.page = p;
    history.push(`${location.pathname}?${sqs}`);
  };

  const setParentQuery = (fsq: FileSearchQuery) => window.sessionStorage.setItem(PARENT_FILE_SEARCH_QUERY, JSON.stringify(fsq));

  return [files, count, page, maxPage, prevPage, nextPage, goToPage, query, parentQuery, setParentQuery];
}
