import React from 'react';

import { File } from '../../entities';

interface FileListProps
{
  files: File[];
}

export default function FileList({ files }: FileListProps)
{
  return (
    <ul>
      {files.map((file) =>
      <li key={file.id}>
        {file.name}, {file.extension}, {file.fullPath}
      </li>)}
    </ul>
  );
}
