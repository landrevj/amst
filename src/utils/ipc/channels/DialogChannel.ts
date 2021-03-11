import { dialog, IpcMainEvent } from 'electron';
import { IpcChannelInterface, IpcRequest } from "../IpcChannel";

export type DialogPropertiesOptions =
  Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent'>;

export class DialogChannel implements IpcChannelInterface
{
  // eslint-disable-next-line class-methods-use-this
  getName(): string
  {
    return 'open-dialog';
  }

  async handle(event: IpcMainEvent, request: IpcRequest)
  {
    if (!request.responseChannel) request.responseChannel = `${this.getName()}_response`;

    if (request.params)
    {
      const args = request.params as DialogPropertiesOptions;
      const res = await dialog.showOpenDialog({
        properties: args,
      });
      event.sender.send(request.responseChannel, res);
    }
  }
}
