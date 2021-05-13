/* eslint-disable react/no-array-index-key */
import React from 'react';

import { FolderStub } from '../../../db/entities';

interface FolderListProps
{
  folders?: FolderStub[];
  loading?: boolean;
}

export default function FolderList({ folders, loading }: FolderListProps)
{
  // console.log(folders);

  return !loading && folders ? (
    <ul>
      {folders.map((folder) =>
      <li key={folder.id}>
        {folder.path}
      </li>)}
    </ul>
  ) : (
    <ul className='space-y-2'>
      <li>
        <div className='p-2 bg-gray-300 rounded-full w-80 animate-pulse'/>
      </li>
      <li>
        <div className='p-2 bg-gray-300 rounded-full w-40 animate-pulse'/>
      </li>
    </ul>
  );
}

FolderList.defaultProps = {
  folders: [],
  loading: undefined,
};
