/* eslint-disable import/prefer-default-export */
import { FilterQuery, FindOptions, QBFilterQuery, QueryOrder } from '@mikro-orm/core';
import md5File from 'md5-file';
// import log from 'electron-log';

import { DB } from '../../db';
import { EntityChannel } from './Entity';
import { File, Tag } from '../../db/entities';
import { SocketRequest } from '../../utils/websocket';
import { IFileSearchQuery } from '../../renderer/components/File/Search/Query';

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
  async search(request: SocketRequest<IFileSearchQuery>)
  {
    this.handleAction(request, async (q) => {
      const em = DB.getNewEM();
      if (!em) return undefined;

      const qb = em.createQueryBuilder(File, 'f').select('*', true);
      const qbCount = em.createQueryBuilder(File, 'f').count('f.id', true);
      const qbBoth = [qb, qbCount];

      const {
        name, extension, fullPath, mimeType, md5,
        workspaceID, tags, andOr,
        page, limit,
      } = q;

      if (workspaceID)
      {
        qbBoth.forEach(e => {
          e.leftJoin('f.workspaces', 'w')
           .where({ 'w.id': workspaceID });
        });
      }
      if (tags)
      {
        const havingString = Array(tags.length).fill('sum(t.name = ? and t.category = ?)').join(` ${andOr || 'and'} `);
        const flatTags = tags.flat();

        qbBoth.forEach(e => {
          e.leftJoin('f.tags', 't')
           .groupBy('f.id')
           .having(havingString, flatTags);
        });
      }

      const like = (s: string): QBFilterQuery<File> => ({ $like: `%%${s}%%` }); // double % so it doesn't complain about string substitution

      if (name && name !== '')
      {
        qbBoth.forEach(e => {
          e.where({ name: like(name) }, '$and');
        });
      }

      if (extension && extension !== '')
      {
        qbBoth.forEach(e => {
          e.where({ extension }, '$and');
        });
      }

      if (fullPath && fullPath !== '')
      {
        qbBoth.forEach(e => {
          e.where({ fullPath: like(fullPath) }, '$and');
        });
      }

      if (mimeType && mimeType !== '')
      {
        qbBoth.forEach(e => {
          e.where({ mimeType: like(mimeType) }, '$and');
        });
      }

      if (md5 && md5 !== '')
      {
        qbBoth.forEach(e => {
          e.where({ md5 }, '$and');
        });
      }

      qb.orderBy({ id: QueryOrder.DESC });
      qb.limit(limit, (page && limit) ? page * limit : 0); // pagination

      const files = await qb.getResult();
      const [{ count }] = await em.getKnex().sum('count as count').from(qbCount.getKnexQuery());

      return { files, count };
    });
  }

  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////
  async calculateMD5(request: SocketRequest<number>)
  {
    this.handleAction(request, async (id) => {
      const em = DB.getNewEM();
      if (!em || !id) return undefined;

      const file = await em?.findOne(File, id);
      if (!file) return undefined;

      const md5 = md5File.sync(file.fullPath);
      file.md5  = md5;
      em.flush();

      return md5;
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

      case 'addTag':
        this.addTag(request);
        break;
      case 'search':
        this.search(request);
        break;
      case 'calculateMD5':
        this.calculateMD5(request);
        break;

      default:
        break;
    }
  }
}
