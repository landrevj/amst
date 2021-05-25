/* eslint-disable import/prefer-default-export */
import { FilterQuery, FindOptions } from '@mikro-orm/core';
// import log from 'electron-log';

import { EntityChannel } from './Entity';
import { Folder } from '../../db/entities';
import { SocketRequest } from '../../shared/websocket';

export class FolderChannel extends EntityChannel<Folder>
{
  constructor()
  {
    super(Folder);
    this.setName('Folder');
  }

  // /////////////////////////////////////////////////////////
  // //////////////////////// ACTIONS ////////////////////////
  // /////////////////////////////////////////////////////////
  async createAction(request: SocketRequest<[string]>)
  {
    this.handleAction(request, (folderParams) => {
      return this.create(folderParams);
    });
  }

  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////
  async readAction(request: SocketRequest<[FilterQuery<Folder>, FindOptions<Folder>]>)
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
