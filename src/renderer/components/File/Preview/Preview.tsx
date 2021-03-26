import React from 'react';
import { Link } from 'react-router-dom';

import Client from '../../../../utils/websocket/SocketClient';
import { FileStub } from '../../../../db/entities';
import { SupportedImageFormats } from '../index';

import styles from './styles/Preview.scss';

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
    content = (<img src={`http://${Client.host}:${Client.port}/amst/files/${file.id}`} alt={file.name}/>);
  }
  else
  {
    content = (<figcaption>{file.name}</figcaption>);
  }

  return (
    <Link to={`/file/${file.id}`} className={styles.FilePreview}>{content}</Link>
  );
}
