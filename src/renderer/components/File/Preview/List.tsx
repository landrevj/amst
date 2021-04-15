import React from 'react';

import { FileSearchQuery } from '../index';
import { FileStub } from '../../../../db/entities';
import FilePreview from './Preview';

interface FilePreviewListProps
{
  files: FileStub[];
  query?: FileSearchQuery;
  className?: string;
}

export default function FilePreviewList({ files, query, className }: FilePreviewListProps)
{
  const indexStart = (query?.page && query?.limit) ? query.page * query.limit : 0;

  return (
    <div className={`flex flex-col md:flex-row flex-wrap p-4 bg-gray-100 ${className}`}>
      {files.map((file, i) =>
      <figure key={file.id} className='m-1 w-44 max-h-60 flex-auto rounded overflow-hidden'>
        <FilePreview file={file} searchResultIndex={indexStart + i}/>
      </figure>
      )}
    </div>
  );
}

FilePreviewList.defaultProps = {
  query: undefined,
  className: '',
};
