import { ipcMain, IpcMainEvent } from 'electron';

export interface IpcRequest
{
  responseChannel?: string;

  params?: string[];
}

export interface IpcChannelInterface
{
  getName(): string;

  handle(event: IpcMainEvent, request: IpcRequest): void;
}

export function registerIpcChannels(ipcChannels: IpcChannelInterface[]) {
  ipcChannels.forEach(channel => ipcMain.on(channel.getName(), (event, request) => channel.handle(event, request)));
}
