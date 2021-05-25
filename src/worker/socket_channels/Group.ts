/* eslint-disable import/prefer-default-export */
import { FilterQuery, FindOptions, QBFilterQuery, QueryOrder } from '@mikro-orm/core';
// import log from 'electron-log';

import { DB } from '../../db';
import { EntityChannel } from './Entity';
import { File, Group, Tag } from '../../db/entities';
import { SocketRequest } from '../../shared/websocket';
import { IGroupSearchQuery } from '../../renderer/components/Group/Search/Query';

export class GroupChannel extends EntityChannel<Group>
{
  constructor()
  {
    super(Group);
    this.setName('Group');
  }

  // /////////////////////////////////////////////////////////
  // //////////////////////// ACTIONS ////////////////////////
  // /////////////////////////////////////////////////////////
  async createAction(request: SocketRequest<[string]>)
  {
    this.handleAction(request, (groupParams) => {
      return this.create(groupParams);
    });
  }

  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////
  async readAction(request: SocketRequest<[FilterQuery<Group>, FindOptions<Group>]>)
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
    this.handleAction(request, async ([groupID, name, category]) => {
      const em   = DB.getNewEM();
      const group = await em?.findOne(Group, groupID);
      if (em && group)
      {
        const tag = new Tag(name, category);
        group.tags.add(tag);
        await em.persistAndFlush(group);
        return tag;
      }

      return undefined;
    });
  }

  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////
  async search(request: SocketRequest<IGroupSearchQuery>)
  {
    this.handleAction(request, async (q) => {
      const em = DB.getNewEM();
      if (!em) return undefined;

      const qb = em.createQueryBuilder(Group, 'g').select('*', true);
      const qbCount = em.createQueryBuilder(Group, 'g').count('g.id', true);
      const qbBoth = [qb, qbCount];

      const {
        name,
        workspaceID, tags, andOr,
        page, limit, order
      } = q;

      if (workspaceID)
      {
        qbBoth.forEach(e => {
          e.leftJoin('g.members', 'm')
           .leftJoin('m.file', 'f')
           .leftJoin('f.workspaces', 'w')
           .where({ 'w.id': workspaceID });
        });
      }
      if (tags)
      {
        const havingStringArr: string[] = Array(tags.length);
        const queryTags: ([string] | [string, string])[] = Array(tags.length);

        tags.forEach((tag, i) => {
          if (tag[1] === '')
          {
            havingStringArr[i] = 'sum(t.name = ?)';
            queryTags[i] = [tag[0]];
          }
          else
          {
            havingStringArr[i] = 'sum(t.name = ? and t.category = ?)';
            queryTags[i] = tag;
          }
        });

        const havingString = havingStringArr.join(` ${andOr || 'and'} `);
        const flatTags = queryTags.flat();

        qbBoth.forEach(e => {
          e.leftJoin('g.tags', 't')
           .groupBy('g.id')
           .having(havingString, flatTags);
        });
      }

      const like = (s: string): QBFilterQuery<Group> => ({ $like: `%%${s}%%` }); // double % so it doesn't complain about string substitution

      if (name && name !== '')
      {
        qbBoth.forEach(e => {
          e.where({ name: like(name) }, '$and');
        });
      }

      qb.orderBy({ id: order || QueryOrder.ASC });
      qb.limit(limit, (page && limit) ? page * limit : 0); // pagination


      const groups = await qb.getResult();
      const [{ count }] = await em.getKnex().sum('count as count').from(qbCount.getKnexQuery());

      return { groups, count };
    });
  }

  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////
  async getPreviewFiles(request: SocketRequest<number[]>)
  {
    this.handleAction(request, async ids => {
      const em = DB.getNewEM();
      if (!em) return [];

      return em.createQueryBuilder(File, 'f')
        .select(['f.*', 'gm.group_id'])
        .leftJoin('f.groupMemberships', 'gm')
        .where({ groupMemberships: { position: 0, group: ids } })
        .execute('all');
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
      case 'getPreviewFiles':
        this.getPreviewFiles(request);
        break;

      default:
        break;
    }
  }
}
