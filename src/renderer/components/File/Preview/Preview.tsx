import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import QueryString from 'query-string';

import Client from '../../../../utils/websocket/SocketClient';
import { FileStub } from '../../../../db/entities';
import { mimeRegex } from '../../../../utils';
import { FileSearchQuery } from '..';
import { loadQuery } from '../useFileSearchQuery';

interface FilePreviewProps
{
  file: FileStub;
  searchResultIndex?: number;
}

export default function FilePreview({ file, searchResultIndex }: FilePreviewProps)
{
  const location = useLocation();
  const query = loadQuery(location.search);
  const linkQuery: FileSearchQuery = { ...query, limit: 1, page: searchResultIndex };

  const { type } = mimeRegex(file.mimeType || '');
  let content: JSX.Element;
  if (type === 'image')
  {
    content = (<img className='min-w-full rounded-md shadow' src={`http://${Client.host}:${Client.port}/files/${file.id}`} alt={file.name}/>);
  }
  else
  {
    content = (<figcaption className='min-h-full px-1.5 py-1 rounded-md bg-gray-300 truncate'>{file.name}</figcaption>);
  }

  return (
    <Link to={{
      pathname: `/file/${file.id}`,
      search: `?${QueryString.stringify(linkQuery)}`,
      state: { parentQuery: query } }}>
        {content}
    </Link>
  );
}

FilePreview.defaultProps = {
  searchResultIndex: undefined,
};
