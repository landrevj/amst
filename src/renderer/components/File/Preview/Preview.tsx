import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import Client from '../../../../utils/websocket/SocketClient';
import { FileStub } from '../../../../db/entities';
import { mimeRegex } from '../../../../utils';
import FileSearchQuery from '../Search/Query';

interface FilePreviewProps
{
  file: FileStub;
  searchResultIndex?: number;
}

export default function FilePreview({ file, searchResultIndex }: FilePreviewProps)
{
  const location = useLocation();
  const query = new FileSearchQuery(location.search);
  const linkQuery: FileSearchQuery = new FileSearchQuery(location.search);
  linkQuery.limit = 1;
  linkQuery.page = searchResultIndex;

  const { type } = mimeRegex(file.mimeType || '');
  let content: JSX.Element;
  if (type === 'image')
  {
    content = (<img className='min-w-full rounded-md' src={`http://${Client.host}:${Client.port}/files/${file.id}`} alt={file.name}/>);
  }
  else
  {
    content = (<figcaption className='min-h-full px-1.5 py-1 rounded-md bg-gray-300 truncate'>{file.name}</figcaption>);
  }

  return (
    <figure key={file.id} className='m-1 w-44 max-h-60 flex-auto'>
      <Link
        className='block h-full rounded-md'
        to={{ pathname: `/file/${file.id}`,
              search: `?${linkQuery}`,
              state: { parentQuery: query }
            }}>
        <div className='h-full rounded-md overflow-hidden'>
          {content}
        </div>
      </Link>
    </figure>
  );
}

FilePreview.defaultProps = {
  searchResultIndex: undefined,
};
