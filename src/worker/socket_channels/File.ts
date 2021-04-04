/* eslint-disable import/prefer-default-export */
import { FilterQuery, FindOptions } from '@mikro-orm/core';
// import log from 'electron-log';

import { DB } from '../../db';
import { EntityChannel } from './Entity';
import { File, Tag } from '../../db/entities';
import { SocketRequest } from '../../utils/websocket';
import { FileSearchQuery } from '../../renderer/components/File';

export class FileChannel extends EntityChannel<File>
{
  constructor()
  {
    super(File);
    this.setName('File');
  }

  // /////////////////////////////////////////////////////////
  // //////////////////////// ACTIONS ////////////////////////
  // /////////////////////////////////////////////////////////
  async createAction(request: SocketRequest<[string, string, string]>)
  {
    this.handleAction(request, (fileParams) => {
      return this.create(fileParams);
    });
  }

  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////
  async readAction(request: SocketRequest<[FilterQuery<File>, FindOptions<File>]>)
  {
    this.handleAction(request, ([where, options]) => {
      console.log(where);
      return this.read(where, options);
    });
  }

  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////


  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////
  async destroyAction(request: SocketRequest<number[]>)
  {
    this.handleAction(request, (ids) => {
      return this.destroy(ids);
    });
  }

  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////
  async addTag(request: SocketRequest<[number, string, string | undefined]>)
  {
    this.handleAction(request, async ([fileID, name, category]) => {
      const em   = DB.getNewEM();
      const file = await em?.findOne(File, fileID);
      if (em && file)
      {
        const tag = new Tag(name, category);
        file.tags.add(tag);
        await em.persistAndFlush(file);
        return tag;
      }

      return undefined;
    });
  }

  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////
  // async search(request: SocketRequest<FileSearchQuery>)
  // {
  //   this.handleAction(request, async (fsq) => {
  //     const em =
  //   });
  // }

  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handle(request: SocketRequest<any>)
  {
    if (!this.getSocket()) return;

    if (!request.responseChannel) request.responseChannel = `${this.getName()}_response`;

    switch (request.action)
    {
      case 'create':
        this.createAction(request);
        break;
      case 'read':
        this.readAction(request);
        break;
      case 'destroy':
        this.destroyAction(request);
        break;

      case 'addTag':
        this.addTag(request);
        break;

      default:
        break;
    }
  }
}
