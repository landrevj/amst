/* eslint-disable import/prefer-default-export */
import log from 'electron-log';
import { Socket } from 'socket.io';

import { CRUD } from '../../db';
import { SocketChannelInterface, SocketRequest, SocketRequestStatus, SocketResponse } from '../../shared/websocket';

export abstract class EntityChannel<EntityType> extends CRUD<EntityType> implements SocketChannelInterface
{
  private name = 'Entity';
  getName(): string { return this.name; }
  setName(name: string) { this.name = name }

  private private_socket: Socket | undefined;
  getSocket(): Socket | undefined { return this.private_socket }
  setSocket(socket: Socket | undefined) { this.private_socket = socket }

  protected emitFailure(request: SocketRequest<unknown>)
  {
    this.getSocket()?.emit(request.responseChannel as string, { status: SocketRequestStatus.FAILURE });
  }

  protected async handleAction<T, U>(request: SocketRequest<T>, action: (args: T) => Promise<U | undefined>)
  {
    if (!request.params || (Array.isArray(request.params) && !request.params.length))
    {
      this.emitFailure(request);
      return;
    }

    const returnValue = await action(request.params).catch(log.error);

    if (returnValue)
    {
      const response: SocketResponse<U> = {
        status: SocketRequestStatus.SUCCESS,
        data: returnValue,
      };
      this.getSocket()?.emit(request.responseChannel as string, response);
      return;
    }

    this.emitFailure(request);
  }

  abstract handle(request: SocketRequest<unknown>): void;
}
