import { QueryOrder } from "@mikro-orm/core";
import { v4 as uuid } from 'uuid';

export interface ISearchQuery
{
  limit?: number;
  page?: number;
  order?: QueryOrder;

  instanceID?: string;
  parentInstanceID?: string;
}

export abstract class SearchQuery<Props extends ISearchQuery, Results> implements ISearchQuery
{
  public abstract readonly route: string;

  limit?: number;
  page?: number;
  order?: QueryOrder;

  instanceID?: string;
  parentInstanceID?: string;

  constructor()
  {
    this.instanceID = uuid();
  }

  public abstract loadQuery(search: Props | string, overrideInstanceID?: boolean, defaultPerPage?: number): SearchQuery<Props, Results>;
  public abstract getResults(): Promise<[Results[], number | undefined]>;
  public abstract toString(): string;

  abstract get props(): Props & ISearchQuery;
}
