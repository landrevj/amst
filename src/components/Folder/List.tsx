/* eslint-disable react/no-array-index-key */
import React from 'react';

import { Folder } from '../../entities';

interface FolderListProps
{
  folders: Folder[];
}

export default function FolderList({ folders }: FolderListProps)
{
  // console.log(folders);

  if (!folders.length) return <p>Loading...</p>;

  return (
    <ul>
      {folders.map((folder) =>
      <li key={folder.id}>
        {folder.path}
      </li>)}
    </ul>
  );
}
