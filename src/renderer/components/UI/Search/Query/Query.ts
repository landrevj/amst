export default abstract class SearchQuery<Props, Results>
{
  limit?: number;
  page?: number;

  public abstract loadQuery(search: Props | string, defaultPerPage?: number): SearchQuery<Props, Results>;
  public abstract getResults(): Promise<[Results[], number | undefined]>;
  public abstract toString(): string;

  abstract get props(): Props;
}
