import React from 'react';

import { FileStub } from '../../../../db/entities';
import FileSearchQuery from '../Search/Query';
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
      <FilePreview file={file} searchResultIndex={indexStart + i} key={file.id}/>
      )}
    </div>
  );
}

FilePreviewList.defaultProps = {
  query: undefined,
  className: '',
};
