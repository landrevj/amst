import React from 'react';

import { FileStub } from '../../../../db/entities';
import FilePreview from './Preview';

import styles from './styles/List.scss';

interface FilePreviewListProps
{
  files: FileStub[];
}


export default function FilePreviewList({ files }: FilePreviewListProps)
{
  return (
    <div className={styles.FilePreviewList}>
      {files.map((file) =>
      <figure key={file.id}>
        <FilePreview file={file}/>
      </figure>
      )}
    </div>
  );
}
