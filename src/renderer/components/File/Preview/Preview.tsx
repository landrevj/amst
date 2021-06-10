import React from 'react';

import Client from '../../../../shared/websocket/SocketClient';
import { FileStub } from '../../../../db/entities';
import { mimeRegex } from '../../../../utils';

interface FilePreviewProps
{
  file: FileStub;
  showName?: boolean;
  className?: string;
  imgClassName?: string;
}

export default function FilePreview({ file, showName = false, className, imgClassName = 'max-h-72' }: FilePreviewProps)
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
    <figure key={file.id} className={`rounded overflow-hidden ${className}`} >
      <div className={`overflow-hidden ${showName ? '' : 'rounded'} ${imgClassName}`}>
        {content}
      </div>
      {showName ? <figcaption className='px-2 py-1 text-sm bg-gray-200 truncate'>{file.name}</figcaption> : <></>}
    </figure>
  );
}

FilePreview.defaultProps = {
  showName: false,
  className: '',
  imgClassName: 'max-h-72',
};
