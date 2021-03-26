import React from 'react';

import { FileStub } from '../../../../db/entities';
import FilePreview from './Preview';

interface FilePreviewListProps
{
  files: FileStub[];
}


export default function FilePreviewList({ files }: FilePreviewListProps)
{
  return (
    <div className='flex flex-col md:flex-row flex-wrap p-4 bg-gray-100'>
      {files.map((file) =>
      <figure key={file.id} className='m-1 w-44 max-h-60 flex-auto rounded overflow-hidden'>
        <FilePreview file={file}/>
      </figure>
      )}
    </div>
  );
}
