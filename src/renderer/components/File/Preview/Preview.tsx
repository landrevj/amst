import React from 'react';
import { Link } from 'react-router-dom';

import Client from '../../../../utils/websocket/SocketClient';
import { FileStub } from '../../../../db/entities';
import { SupportedImageFormats } from '../index';

interface FilePreviewProps
{
  file: FileStub;
}

export default function FilePreview({ file }: FilePreviewProps)
{
  const format = file.extension.toLowerCase();
  const isImage = SupportedImageFormats.has(format);

  let content: JSX.Element;
  if (isImage)
  {
    content = (<img className='min-w-full rounded-md shadow' src={`http://${Client.host}:${Client.port}/amst/files/${file.id}`} alt={file.name}/>);
  }
  else
  {
    content = (<figcaption className='min-h-full px-1.5 py-1 rounded-md bg-gray-300 truncate'>{file.name}</figcaption>);
  }

  return (
    <Link to={`/file/${file.id}`}>{content}</Link>
  );
}
