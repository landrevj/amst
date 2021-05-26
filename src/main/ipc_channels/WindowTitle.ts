import { BrowserWindow, IpcMainEvent } from 'electron';
import { IpcChannelInterface, IpcRequest } from "../../shared/ipc/IpcChannel";

export default class WindowTitleChannel implements IpcChannelInterface
{
  // eslint-disable-next-line class-methods-use-this
  getName(): string
  {
    return 'window-title';
  }

  handle(event: IpcMainEvent, request: IpcRequest)
  {
    if (!request.responseChannel) request.responseChannel = `${this.getName()}_response`;

    if (request.params)
    {
      const arg = request.params[0] as string;

      const window = BrowserWindow.fromWebContents(event.sender);
      if (window)
      {
        window.setTitle(arg);
        event.sender.send(request.responseChannel, 'success');
      }
      else event.sender.send(request.responseChannel, 'failure');
    }
  }
}
