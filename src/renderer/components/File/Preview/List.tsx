import React from 'react';

import { FileStub } from '../../../../db/entities';
import { Card } from '../../UI/Card';
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
    <Card empty={files.length === 0} className={`md:flex-row flex-wrap place-content-start ${className}`}>
      {files.map((file, i) =>
      <FilePreview file={file} searchResultIndex={indexStart + i} key={file.id}/>
      )}
    </Card>
  );
}

FilePreviewList.defaultProps = {
  query: undefined,
  className: '',
};
