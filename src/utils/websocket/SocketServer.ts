import { createServer } from "http";
import { Server, Socket } from 'socket.io';
// import log from 'electron-log';

import { SocketRequest, SocketChannelInterface } from './index';

const DEFAULT_SOCKET_IO_PORT = 3000;

class SocketServer
{
  private static instance: SocketServer;

  private io: Server | undefined;
  private port: number | undefined;

  private constructor() { /* */ }

  public init(channels: SocketChannelInterface[], port?: number)
  {
    const httpServer = createServer();
    this.io = new Server(httpServer, {});

    this.io.on('connection', (socket) => {
      socket.send('worker/index.ts: Connected!');

      SocketServer.registerChannels(socket, channels);
    });

    this.port = port || DEFAULT_SOCKET_IO_PORT;

    httpServer.listen(this.port);
  }

  public static getInstance(): SocketServer {
    if (!SocketServer.instance) SocketServer.instance = new SocketServer();
    return SocketServer.instance;
  }

  static registerChannels(socket: Socket, channels: SocketChannelInterface[])
  {
    channels.forEach(channel => {
      channel.setSocket(socket);
      socket.on(channel.getName(), (request: SocketRequest<unknown>) => channel.handle(request))
    });
  }
}

const server = SocketServer.getInstance();
export default server;
