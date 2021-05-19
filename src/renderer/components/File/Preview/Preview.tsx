import React from 'react';

import Client from '../../../../utils/websocket/SocketClient';
import { FileStub } from '../../../../db/entities';
import { mimeRegex } from '../../../../utils';

interface FilePreviewProps
{
  file: FileStub;
}

export default function FilePreview({ file }: FilePreviewProps)
{
  const { type } = mimeRegex(file.mimeType || '');
  let content: JSX.Element;
  if (type === 'image')
  {
    content = (<img className='min-w-full' src={`http://${Client.host}:${Client.port}/files/${file.id}`} alt={file.name}/>);
  }
  else
  {
    content = (<></>);
  }

  return (
    <figure key={file.id} className='w-48 rounded overflow-hidden flex-auto'>
      <div className='max-h-72 overflow-hidden'>
        {content}
      </div>
      <figcaption className='px-2 py-1 text-sm bg-gray-200 truncate'>{file.name}</figcaption>
    </figure>
  );
}
