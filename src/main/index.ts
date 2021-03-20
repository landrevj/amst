// import log from 'electron-log';

import { IpcChannelInterface, registerIpcChannels } from '../utils/ipc';
import { AppPathChannel, DialogChannel } from './ipc_channels';

// eslint-disable-next-line import/prefer-default-export
export async function main()
{
  const ipcChannels: IpcChannelInterface[] = [
    new AppPathChannel(),
    new DialogChannel(),
  ];
  registerIpcChannels(ipcChannels);
}
