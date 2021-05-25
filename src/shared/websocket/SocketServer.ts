import { createServer } from "http";
import { Server as SocketIOServer, Socket } from 'socket.io';

// import log from 'electron-log';

import { SocketRequest, SocketChannelInterface } from './index';
import fileRequestListener from "./FileServer";
import { IpcService } from "../ipc";

const DEFAULT_SOCKET_IO_PORT = 3000;

class SocketServer
{
  private static instance: SocketServer;

  private io: SocketIOServer | undefined;
  private port: number | undefined;

  private constructor() { /* */ }

  public async init(channels: SocketChannelInterface[], port?: number)
  {
    const ipc          = new IpcService();
    const userDataPath = await ipc.send<string>('app-path', { params: ['userData'] });

    const httpServer = createServer((req, res) => fileRequestListener(req, res, userDataPath));
    this.io = new SocketIOServer(httpServer, {});

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

const Server = SocketServer.getInstance();
export default Server;
