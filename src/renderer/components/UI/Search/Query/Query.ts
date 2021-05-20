import { QueryOrder } from "@mikro-orm/core";

export interface ISearchQuery
{
  limit?: number;
  page?: number;
  order?: QueryOrder;
}

export abstract class SearchQuery<Props, Results> implements ISearchQuery
{
  public abstract readonly route: string;

  limit?: number;
  page?: number;
  order?: QueryOrder;

  public abstract loadQuery(search: Props | string, defaultPerPage?: number): SearchQuery<Props, Results>;
  public abstract getResults(): Promise<[Results[], number | undefined]>;
  public abstract toString(): string;

  abstract get props(): Props;
}
