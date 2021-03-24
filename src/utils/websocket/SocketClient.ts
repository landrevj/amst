/* eslint @typescript-eslint/no-explicit-any: ["error", { "ignoreRestArgs": true }] */
import io from 'socket.io-client';
import { v4 as uuid } from 'uuid';
import log from 'electron-log';

import { SocketRequest, SocketResponse } from './index';

const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = 3000;

class SocketClient
{
  private static instance: SocketClient;

  private socket: SocketIOClient.Socket | undefined;
  private host: string | undefined;
  private port: number | undefined;

  private constructor() { /* */ }

  public init(host: string = DEFAULT_HOST, port: number = DEFAULT_PORT)
  {
    this.host = host;
    this.port = port;

    this.socket = io(`http://${this.host}:${this.port}`, {});

    // this.socket.onAny((event: string, ...args: any[]) => {
    //   log.info(event, args);
    // });
  }

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) SocketClient.instance = new SocketClient();
    return SocketClient.instance;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public send<T>(channel: string, request: SocketRequest<any>): Promise<SocketResponse<T>>
  {
    if (!this.socket) throw new Error('Client.ts: Client socket was undefined or null. Was init() called?');

    if (!request.responseChannel) request.responseChannel = `${channel}_response_${uuid()}`;

    // log.info(channel, request);
    this.socket.emit(channel, request);

    return new Promise(resolve => {
      this.socket?.once(request.responseChannel as string, (response: SocketResponse<T>) => resolve(response));
    });
  }
}

const client = SocketClient.getInstance();
export default client;
