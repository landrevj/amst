/* eslint @typescript-eslint/no-explicit-any: ["error", { "ignoreRestArgs": true }] */
import io from 'socket.io-client';
import { v4 as uuid } from 'uuid';
// import log from 'electron-log';

import { SocketRequest, SocketResponse } from './index';

const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = 3000;

class SocketClient
{
  private static instance: SocketClient;

  private private_socket: SocketIOClient.Socket | undefined;
  private private_host: string | undefined;
  private private_port: number | undefined;

  private constructor() { /* */ }

  public init(host: string = DEFAULT_HOST, port: number = DEFAULT_PORT)
  {
    this.private_host = host;
    this.private_port = port;

    this.private_socket = io(`http://${this.host}:${this.port}`, {});

    // this.socket.onAny((event: string, ...args: any[]) => {
    //   log.info(event, args);
    // });
  }

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) SocketClient.instance = new SocketClient();
    return SocketClient.instance;
  }

  isLocal(): boolean { return this.host === 'localhost' || this.host === '127.0.0.1' };

  get host(): string | undefined { return this.private_host; }
  get port(): number | undefined { return this.private_port; }

  get socket(): SocketIOClient.Socket | undefined { return this.private_socket; }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public send<T>(channel: string, request: SocketRequest<any>): Promise<SocketResponse<T>>
  {
    if (!this.private_socket) throw new Error('Client.ts: Client socket was undefined or null. Was init() called?');

    if (!request.responseChannel) request.responseChannel = `${channel}_response_${uuid()}`;

    // log.info(channel, request);
    this.private_socket.emit(channel, request);

    return new Promise(resolve => {
      this.private_socket?.once(request.responseChannel as string, (response: SocketResponse<T>) => resolve(response));
    });
  }
}

const Client = SocketClient.getInstance();
export default Client;
