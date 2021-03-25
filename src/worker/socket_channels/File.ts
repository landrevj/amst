/* eslint-disable import/prefer-default-export */
import { FilterQuery, FindOptions } from '@mikro-orm/core';
// import log from 'electron-log';

import { EntityChannel } from './Entity';
import { File } from '../../db/entities';
import { SocketRequest } from '../../utils/websocket';

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

      default:
        break;
    }
  }
}
