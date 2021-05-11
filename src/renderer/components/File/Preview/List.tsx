import React from 'react';
import { sample } from 'lodash';

import { FileStub } from '../../../../db/entities';
import FileSearchQuery from '../Search/Query';
import FilePreview from './Preview';

interface FilePreviewListProps
{
  loading?: boolean;
  files: FileStub[];
  query?: FileSearchQuery;
}

const heights = ['h-24', 'h-28', 'h-32', 'h-36', 'h-40', 'h-44', 'h-48', 'h-52', 'h-56', 'h-60'];

export default function FilePreviewList({ loading, files, query }: FilePreviewListProps)
{
  const indexStart = (query?.page && query?.limit) ? query.page * query.limit : 0;

  // eslint-disable-next-line react/no-array-index-key
  const placeholders = Array(9).fill('').map((_, i) => <div className={`w-44 max-h-60 flex-auto bg-gray-200 rounded ${sample(heights)} animate-pulse`} key={i}/>);
  const filePreviews = files.map((file, i) => <FilePreview file={file} searchResultIndex={indexStart + i} key={file.id}/>);

  return (
    <div className='flex flex-row flex-wrap place-content-start gap-2'>
      {loading ? placeholders : filePreviews }
    </div>
  );
}

FilePreviewList.defaultProps = {
  loading: false,
  query: undefined,
};
