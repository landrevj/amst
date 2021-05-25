import { app, IpcMainEvent } from 'electron';
import { IpcChannelInterface, IpcRequest } from "../../shared/ipc/IpcChannel";

export type AppPathOptions = "module" | "cache" | "home" | "appData" | "userData" | "temp" | "exe" | "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos" | "recent" | "logs" | "crashDumps";

export default class AppPathChannel implements IpcChannelInterface
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
