import React from 'react';

import { FileStub } from '../../../db/entities';

interface FileListProps
{
  paginate: boolean;
  page: number;
  onPageChange: (page: number) => void;
  files: FileStub[];
}


export default class FileList extends React.Component<FileListProps>
{
  constructor(props: FileListProps)
  {
    super(props);
    this.onPageUp   = this.onPageUp.bind(this);
    this.onPageDown = this.onPageDown.bind(this);
  }

  onPageUp()
  {
    const { onPageChange, page } = this.props;
    onPageChange(page + 1);
  }

  onPageDown()
  {
    const { onPageChange, page } = this.props;
    if (page > 0) onPageChange(page - 1);
  }

  render()
  {
    const { files, paginate } = this.props;

    const paginateButtons = (
      <>
        <button type='button' onClick={this.onPageDown}>prev</button>
        <button type='button' onClick={this.onPageUp}>next</button>
      </>
    );

    return (
      <>
        {paginate ? paginateButtons : <></>}
        <ul>
          {files.map((file) =>
          <li key={file.id}>
            {file.name}, {file.extension}, {file.fullPath}
          </li>)}
        </ul>
      </>
    );
  }
}
