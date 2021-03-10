import { IpcRenderer } from 'electron';
import { IpcRequest } from './IpcChannel';

export default class IpcService {
  private ipcRenderer?: IpcRenderer;

  public send<T>(channel: string, request: IpcRequest): Promise<T>
  {
    // If the ipcRenderer is not available try to initialize it
    if (!this.ipcRenderer) this.initializeIpcRenderer();

    // If there's no responseChannel let's auto-generate it
    if (!request.responseChannel) request.responseChannel = `${channel}_response_${new Date().getTime()}`;

    const { ipcRenderer } = this;
    if (!ipcRenderer) throw new Error('IpcService.ts: ipcRenderer was not truthy.');

    ipcRenderer.send(channel, request);

    // This method returns a promise which will be resolved when the response has arrived.
    return new Promise(resolve => {
      // request.responseChannel shouldn't be undefined here because of the if statement above right? casting it to string to get the compiler to stop complaining
      ipcRenderer.once(request.responseChannel as string, (_event, response) => resolve(response));
    });
  }

  public sendSync<T>(channel: string, request: IpcRequest): T
  {
    if (!this.ipcRenderer) this.initializeIpcRenderer();

    const { ipcRenderer } = this;
    if (!ipcRenderer) throw new Error('IpcService.ts: ipcRenderer was not truthy.');

    return ipcRenderer.sendSync(channel, request);
  }

  private initializeIpcRenderer()
  {
    if (!window || !window.process || !window.require)
      throw new Error(`Unable to require renderer process`);

    this.ipcRenderer = window.require('electron').ipcRenderer;
  }
}
