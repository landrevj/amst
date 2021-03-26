import { createServer, IncomingMessage, ServerResponse } from "http";
import { Server, Socket } from 'socket.io';
import send from 'send';
import log from 'electron-log';

import { DB } from '../../db';
import { SocketRequest, SocketChannelInterface } from './index';
import { File } from "../../db/entities";

const DEFAULT_SOCKET_IO_PORT = 3000;

async function fileRequestListener(req: IncomingMessage, res: ServerResponse)
{
  const re = /^\/amst\/files\/(\d+)$/;
  if (!req.url)
  {
    res.writeHead(500);
    res.end("Missing Request URL");
    return;
  }
  const match = req.url.match(re);
  const fileID = match ? parseInt(match[1], 10) : undefined;

  const em = DB.getNewEM();
  const results = await em?.find(File, { id: fileID });
  if (results?.length)
  {
    const file = results[0];
    const path = file.fullPath;

    log.verbose(`SocketServer.ts: Sending file with id ${fileID}`);
    send(req, encodeURIComponent(path), {}).pipe(res);
  }
  else
  {
    res.writeHead(404);
    res.end("Not Found");
  }
}


class SocketServer
{
  private static instance: SocketServer;

  private io: Server | undefined;
  private port: number | undefined;

  private constructor() { /* */ }

  public init(channels: SocketChannelInterface[], port?: number)
  {
    const httpServer = createServer(fileRequestListener);
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
