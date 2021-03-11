import { app, IpcMainEvent } from 'electron';
import { IpcChannelInterface, IpcRequest } from "../IpcChannel";

export type AppPathOptions =
  'home' | 'appData' | 'userData' | 'cache' | 'temp' | 'exe' | 'module' | 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos' | 'recent' | 'logs' | 'pepperFlashSystemPlugin' | 'crashDumps';

export class AppPathChannel implements IpcChannelInterface
{
  // eslint-disable-next-line class-methods-use-this
  getName(): string
  {
    return 'app-path';
  }

  handle(event: IpcMainEvent, request: IpcRequest)
  {
    if (!request.responseChannel) request.responseChannel = `${this.getName()}_response`;

    if (request.params)
    {
      const arg = request.params[0] as AppPathOptions;
      event.sender.send(request.responseChannel, app.getPath(arg));
    }
  }
}
