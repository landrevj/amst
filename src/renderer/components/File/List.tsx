import React from 'react';

import { FileStub } from '../../../db/entities';

interface FileListProps
{
  files: FileStub[];
}


export default function FileList({ files }: FileListProps)
{
  return (
    <ul>
      {files.map((file) =>
      <li key={file.id}>
        {file.name}, {file.extension}, {file.filePath}, {file.createdAt}
      </li>)}
    </ul>
  );
}
