import { createServer, IncomingMessage, ServerResponse } from "http";
import { Server as SocketIOServer, Socket } from 'socket.io';
import send from 'send';
import StreamZip from "node-stream-zip";
// import log from 'electron-log';

import { DB } from '../../db';
import { SocketRequest, SocketChannelInterface } from './index';
import { File } from "../../db/entities";

const DEFAULT_SOCKET_IO_PORT = 3000;

async function fileRequestListener(req: IncomingMessage, res: ServerResponse)
{
  if (!req.url)
  {
    res.writeHead(500);
    res.end("Missing Request URL");
    return;
  }
  const re = /^\/files\/(\d+)$/;
  const match = req.url.match(re);
  if (match)
  {
    const fileID = parseInt(match[1], 10);

    const em = DB.getNewEM();
    const file = await em?.findOne(File, fileID);
    if (file)
    {
      // log.verbose(`SocketServer.ts: Sending file with id ${fileID}`);
      if (file.archivePath !== '')
      {
        // eslint-disable-next-line new-cap
        const zip = new StreamZip.async({ file: file.filePath });
        const stm = await zip.stream(file.archivePath);
        stm.pipe(res);
        stm.on('end', () => zip.close());
        return;
      }

      send(req, encodeURIComponent(file.filePath), {}).pipe(res);
      return;
    }
  }

  res.writeHead(404);
  res.end("Not Found");
}


class SocketServer
{
  private static instance: SocketServer;

  private io: SocketIOServer | undefined;
  private port: number | undefined;

  private constructor() { /* */ }

  public init(channels: SocketChannelInterface[], port?: number)
  {
    const httpServer = createServer(fileRequestListener);
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
