import { join } from "path";
import { IncomingMessage, ServerResponse } from "http";
import send from 'send';
import StreamZip from "node-stream-zip";
import { access, unlink } from 'fs/promises';
import Jimp from 'jimp/es';
import log from 'electron-log';

import { DB } from '../../../db';
import { File } from "../../../db/entities";
import { fileIDToThumbnailPath, mimeRegex } from "../../../utils/utils";
import { THUMBNAIL_DIR, THUMBNAIL_DIR_WORKING } from "../../paths";

async function handleFileSend(req: IncomingMessage, res: ServerResponse, file: File)
{
  if (file.archivePath !== '')
  {
    // eslint-disable-next-line new-cap
    const zip = new StreamZip.async({ file: file.filePath, skipEntryNameValidation: true });
    const stm = await zip.stream(file.archivePath);
    stm.pipe(res);
    stm.on('end', () => zip.close());
    return;
  }

  send(req, encodeURIComponent(file.filePath), {}).pipe(res);
}

async function getThumbnailPathOrCreate(file: File, userDataPath: string)
{
  const { type, subtype } = mimeRegex(file.mimeType || '');
  if (type !== 'image') return '';

  const thumbPath = join(
    join(userDataPath, THUMBNAIL_DIR),
    fileIDToThumbnailPath(file.id).concat(file.extension === '' ? '' : `.${file.extension}`)
  );

  try // if the thumbnail already exists we can just return the path
  {
    await access(thumbPath);
    return thumbPath;
  }
  catch (e) // if there is an error checking the file
  {
    if (e.code !== 'ENOENT') // if the error was something unexpected just log and return
    {
      log.error(e.code);
      return '';
    }

    // otherwise create the thumbnail and continue

    let filePath: string;
    if (file.archivePath !== '')
    {
      // eslint-disable-next-line new-cap
      const zip = new StreamZip.async({ file: file.filePath, skipEntryNameValidation: true });
      filePath = join(join(userDataPath, THUMBNAIL_DIR_WORKING), file.id.toString().concat(file.extension === '' ? '' : `.${file.extension}`));
      await zip.extract(file.archivePath, filePath);
      await zip.close();
    }
    else filePath = file.filePath;

    // console.log(filePath);
    try {
      const processedFile = await Jimp.read(filePath);
      await processedFile
        .resize(300, Jimp.AUTO)
        .quality(60)
        .writeAsync(thumbPath);
      // console.log(type, subtype);
    }
    catch (error)
    {
      log.error(error);
      return '';
    }

    if (file.archivePath !== '')
    {
      try
      {
        await unlink(filePath);
        log.verbose(`unlinked extracted archive file after thumbnailing at ${filePath}`);
      }
      catch (error)
      {
        log.error(error);
      }
    }

    return thumbPath;
  }
}

async function handleFileThumbnailSend(req: IncomingMessage, res: ServerResponse, file: File, userDataPath: string)
{
  // console.log('erere');
  const fp = await getThumbnailPathOrCreate(file, userDataPath);
  // console.log(fp);

  if (fp !== '') send(req, encodeURIComponent(fp), {}).pipe(res);
  else handleFileSend(req, res, file);
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

