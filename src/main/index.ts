// import log from 'electron-log';
import { app } from 'electron';
import log from 'electron-log';
import { mkdir } from 'fs';
import { join } from 'path';

import { THUMBNAIL_DIR_WORKING } from '../shared/paths';

import { IpcChannelInterface, registerIpcChannels } from '../shared/ipc';
import { AppPathChannel, DialogChannel, WindowActionChannel, WindowTitleChannel } from './ipc_channels';

// eslint-disable-next-line import/prefer-default-export
export async function main()
{
  const tnd = join(app.getPath('userData'), THUMBNAIL_DIR_WORKING);
  mkdir(join(app.getPath('userData'), THUMBNAIL_DIR_WORKING), { recursive: true }, err => {
    if (err) log.error(err);
    log.info(`created thumbnail dirs at ${tnd}`)
  });

  const ipcChannels: IpcChannelInterface[] = [
    new AppPathChannel(),
    new DialogChannel(),
    new WindowActionChannel(),
    new WindowTitleChannel(),
  ];
  registerIpcChannels(ipcChannels);
}
