import { BrowserWindow, IpcMainEvent } from 'electron';
import { IpcChannelInterface, IpcRequest } from "../../utils/ipc/IpcChannel";

export type RendererWindowOptions = 'minimize' | 'maximize' | 'close';

export class RendererWindowChannel implements IpcChannelInterface
{
  // eslint-disable-next-line class-methods-use-this
  getName(): string
  {
    return 'renderer-window';
  }

  handle(event: IpcMainEvent, request: IpcRequest)
  {
    if (!request.responseChannel) request.responseChannel = `${this.getName()}_response`;

    if (request.params)
    {
      const arg = request.params[0] as RendererWindowOptions;

      const window = BrowserWindow.getFocusedWindow();

      switch(arg)
      {
        case 'minimize':
          window?.minimize();
          event.sender.send(request.responseChannel, 'minimized');
          break;
        case 'maximize':
          window?.maximize();
          event.sender.send(request.responseChannel, 'maximized');
          break;
        case 'close':
          window?.close();
          event.sender.send(request.responseChannel, 'closed');
          break;
        default:
          event.sender.send(request.responseChannel, 'unknown');
      }
    }
  }
}
