import { join } from "path";
import { IncomingMessage, ServerResponse } from "http";
import send from 'send';
import StreamZip from "node-stream-zip";
import { unlink } from 'fs';
import sharp from 'sharp';
import log from 'electron-log';

import { DB } from '../../../db';
import { File } from "../../../db/entities";
import { fileIDToThumbnailPath, mimeRegex } from "../../utils";
import { THUMBNAIL_DIR, THUMBNAIL_DIR_WORKING } from "../../../shared/paths";

async function handleFileSend(req: IncomingMessage, res: ServerResponse, file: File)
{
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
}

async function handleFileThumbnailSend(req: IncomingMessage, res: ServerResponse, file: File, userDataPath: string)
{
  const { type } = mimeRegex(file.mimeType || '');
  if (type !== 'image') return;

  let filePath: string;
  if (file.archivePath !== '')
  {
    // eslint-disable-next-line new-cap
    const zip = new StreamZip.async({ file: file.filePath });
    filePath = join(join(userDataPath, THUMBNAIL_DIR_WORKING), file.id.toString().concat(file.extension === '' ? '' : `.${file.extension}`));
    await zip.extract(file.archivePath, filePath);
    await zip.close();
  }
  else filePath = file.filePath;

  // console.log(filePath);
  const thumbPath = join(join(userDataPath, THUMBNAIL_DIR), fileIDToThumbnailPath(file.id).concat(file.extension === '' ? '' : `.${file.extension}`));
  // sharp(filePath)
  //   .resize(300)
  //   .on('info', info => {
  //     log.info(`resized height ${info.height}`);
  //   });
  // console.log(thumbPath);

  if (file.archivePath !== '')
  {
    unlink(filePath, (err) => {
      if (err) log.error(err);
      log.verbose(`unlinked extracted archive file after thumbnailing at ${filePath}`);
    });
  }

}

export default async function fileRequestListener(req: IncomingMessage, res: ServerResponse, userDataPath: string)
{
  if (!req.url)
  {
    res.writeHead(500);
    res.end("Missing Request URL");
    return;
  }
  const re = /^\/files\/(\d+)(_thumb)?$/;
  const match = req.url.match(re);
  if (match)
  {
    const fileID = parseInt(match[1], 10);
    const doThumb = !!match[2];

    const em = DB.getNewEM();
    const file = await em?.findOne(File, fileID);
    if (file)
    {
      // log.verbose(`SocketServer.ts: Sending file with id ${fileID}`);
      if (doThumb)
      {
        handleFileThumbnailSend(req, res, file, userDataPath);
        return;
      }

      handleFileSend(req, res, file);
      return;
    }
  }

  res.writeHead(404);
  res.end("Not Found");
}

