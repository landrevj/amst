/* eslint-disable @typescript-eslint/no-explicit-any */
import { Socket } from 'socket.io';

export interface SocketRequest<T>
{
  action?: string;
  responseChannel?: string;
  params?: T;
}

export interface SocketResponse<T>
{
  status: SocketRequestStatus;
  data?: T;
}

export enum SocketRequestStatus
{
  SUCCESS = 'SUCCESS',
  RUNNING = 'RUNNING',
  FAILURE = 'FAILURE',
}

export interface SocketChannelInterface
{
  getName(): string;
  setSocket(socket: Socket): void;

  handle(request: SocketRequest<unknown>): void;
}

