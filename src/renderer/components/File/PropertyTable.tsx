import React from 'react';
import TimeAgo from 'javascript-time-ago';
import log from 'electron-log';

import { FileStub } from '../../../db/entities';
import { SocketRequestStatus } from '../../../utils/websocket';
import Client from '../../../utils/websocket/SocketClient';

interface FilePropertyTableProps
{
  file?: FileStub;
  loading?: boolean;
  updateMD5?: (md5: string) => void;
}

export default class FilePropertyTable extends React.Component<FilePropertyTableProps>
{
  constructor(props: FilePropertyTableProps)
  {
    super(props);

    this.handleCalculateMD5 = this.handleCalculateMD5.bind(this);
  }

  async handleCalculateMD5()
  {
    const { file, updateMD5 } = this.props;
    if (!file || !updateMD5) return;

    const response = await Client.send<string>('File', { action: 'calculateMD5', params: file.id });
    const success  = response.status === SocketRequestStatus.SUCCESS;
    if (!success || !response.data)
    {
      log.error(`An error occurred while calculating MD5 for file with id: ${file.id}`);
      return;
    }

    updateMD5(response.data);
  }

  render()
  {
    const { file, loading } = this.props;

    if (!file || loading)
    {
      return (
        <table className='table-fixed animate-fade-in'>
          <tbody>
            <tr><td className='text-right font-bold pr-2'>#</td><td><span className='text-sm-loading block w-24'/></td></tr>
            <tr><td className='text-right font-bold pr-2'>name</td><td><span className='text-sm-loading block w-56'/></td></tr>
            <tr><td className='text-right font-bold pr-2'>extension</td><td><span className='text-sm-loading block w-16'/></td></tr>
            <tr><td className='text-right font-bold pr-2'>mime</td><td><span className='text-sm-loading block w-44'/></td></tr>
            <tr><td className='text-right font-bold pr-2'>md5</td><td><span className='text-sm-loading block w-52'/></td></tr>
            <tr><td className='text-right font-bold pr-2'>imported</td><td><span className='text-sm-loading block w-36'/></td></tr>
            <tr><td className='text-right font-bold pr-2'>path</td><td><span className='text-sm-loading block w-72'/></td></tr>
          </tbody>
        </table>
      );
    }

    const timeAgo = new TimeAgo();
    const md5Button = <button type='button' onClick={this.handleCalculateMD5}>update</button>;
    return (
      <table className='table-fixed'>
        <tbody>
          <tr>
            <th className='text-right align-top font-bold pr-2'>#</th>
            <td className='break-all'>{file.id}</td>
          </tr>
          <tr>
            <th className='text-right align-top font-bold pr-2'>name</th>
            <td className='break-all'>{file.name}</td>
          </tr>
          <tr>
            <th className='text-right align-top font-bold pr-2'>extension</th>
            <td className='break-all'>{file.extension}</td>
          </tr>
          <tr>
            <th className='text-right align-top font-bold pr-2'>mime</th>
            <td className='break-all'>{file.mimeType || 'unknown'}</td>
          </tr>
          <tr>
            <th className='text-right align-top font-bold pr-2'>md5</th>
            <td className='break-all'>{file.md5 || md5Button}</td>
          </tr>
          <tr>
            <th className='text-right align-top font-bold pr-2'>imported</th>
            <td className='break-all'>{timeAgo.format(Date.parse(file.createdAt))}</td>
          </tr>
          <tr>
            <th className='text-right align-top font-bold pr-2'>path</th>
            <td className='break-all'>{file.filePath}</td>
          </tr>
          <tr>
            <th className='text-right align-top font-bold pr-2'>archive path</th>
            <td className='break-all'>{file.archivePath}</td>
          </tr>
        </tbody>
      </table>
    );
  }
}
