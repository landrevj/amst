import { FilterQuery } from '@mikro-orm/core';
import log from 'electron-log';
import { Socket } from 'socket.io';

import DB from '../../db/DB';
import { Workspace, Folder } from '../../db/entities';
import { SocketChannelInterface, SocketRequest, SocketRequestStatus, SocketResponse } from '../../utils/websocket';

export type WorkspaceChannelOptions = 'ping' | 'pong';

export class WorkspaceChannel implements SocketChannelInterface
{
  private name = 'Workspace';
  getName(): string { return this.name; }

  private socket: Socket | undefined;
  setSocket(socket: Socket) { this.socket = socket; }

  private dbHasEM(request: SocketRequest<unknown>): boolean
  {
    if (DB.em) return true;

    this.emitFailure(request);
    log.error('WorkspaceChannel: DB.em was undefined or null.');
    return false;
  }

  private emitFailure(request: SocketRequest<unknown>)
  {
    this.socket?.emit(request.responseChannel as string, { status: SocketRequestStatus.FAILURE });
  }

  // /////////////////////////////////////////////////////////
  // //////////////////////// ACTIONS ////////////////////////
  // /////////////////////////////////////////////////////////
  async getWorkspaces(request: SocketRequest<[FilterQuery<Workspace>, string[]]>)
  {
    if (!request.params) return; // make sure that we have two params

    const where = request.params[0];
    const populate = request.params[1] || [];

    const workspaces = await DB.em?.find(Workspace, where, populate).catch(error => {
      log.error(error);
      this.emitFailure(request);
    });

    if (workspaces)
    {
      const response: SocketResponse<Workspace[]> = {
        status: SocketRequestStatus.SUCCESS,
        data: workspaces,
      };
      this.socket?.emit(request.responseChannel as string, response);
    }
  }
  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////

  async createWorkspaces(request: SocketRequest<[string, string[]]>)
  {
    if (!(request.params?.length === 2)) return; // make sure that we have two params
    const [ name, paths ] = request.params;

    // use a transaction in case the user violates uniqueness constraints
    const workspace = await DB.em?.transactional<Workspace>(em => {

      const newWorkspace = new Workspace(name);

      paths.forEach((path) => {
        const folder = new Folder(path);
        newWorkspace.folders.add(folder);
      });

      em.persist(newWorkspace);

      return new Promise(resolve => {
        resolve(newWorkspace);
      });

    }).catch(log.error);

    if (workspace)
    {
      const response: SocketResponse<Workspace> = {
        status: SocketRequestStatus.SUCCESS,
        data: workspace,
      };
      this.socket?.emit(request.responseChannel as string, response);
      return;
    }

    this.emitFailure(request);
  }
  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////

  async removeWorkspaces(request: SocketRequest<number[]>)
  {
    const workspaceIDs = request.params;
    if (workspaceIDs)
    {
      const workspaces = await DB.em?.find(Workspace, workspaceIDs);
      if (workspaces)
      {
        await DB.em?.removeAndFlush(workspaces).catch(error => {
          log.error(error);
          this.emitFailure(request);
        });

        this.socket?.emit(request.responseChannel as string, { status: SocketRequestStatus.SUCCESS });
        return;
      }
    }

    this.emitFailure(request);
  }
  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handle(request: SocketRequest<any>)
  {
    if (!this.dbHasEM(request) || !this.socket) return; // check that the DB is initialized and we have a socket

    if (!request.responseChannel) request.responseChannel = `${this.getName()}_response`;

    switch (request.action)
    {
      case 'getWorkspaces':
        this.getWorkspaces(request);
        break;
      case 'createWorkspaces':
        this.createWorkspaces(request);
        break;
      case 'removeWorkspaces':
        this.removeWorkspaces(request);
        break;

      default:
        break;
    }
  }
}
