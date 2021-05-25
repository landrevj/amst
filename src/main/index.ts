// import log from 'electron-log';
import { app } from 'electron';
import log from 'electron-log';
import { mkdir } from 'fs';
import { join } from 'path';

import { THUMBNAIL_DIR, THUMBNAIL_DIR_WORKING } from '../shared/paths';

import { IpcChannelInterface, registerIpcChannels } from '../utils/ipc';
import { AppPathChannel, DialogChannel } from './ipc_channels';
import { RendererWindowChannel } from './ipc_channels/RendererWindow';

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
    new RendererWindowChannel(),
  ];
  registerIpcChannels(ipcChannels);
}
