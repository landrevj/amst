import log from 'electron-log';
import { IpcChannelInterface, registerIpcChannels } from '../utils/ipc';
import { AppPathChannel, DialogChannel } from '../utils/ipc/channels';

if (process.env.NODE_ENV === 'development')
{
  log.transports.console.level = 'debug';
  log.info(`main.ts: Console logging transport set to: ${log.transports.console.level}`)
}

export default function main()
{
  const ipcChannels: IpcChannelInterface[] = [
    new AppPathChannel(),
    new DialogChannel(),
  ];
  registerIpcChannels(ipcChannels);
}
