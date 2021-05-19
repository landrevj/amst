/* eslint-disable react/jsx-props-no-spreading */
// "When Not To Use It: ...or the props spreading is used inside HOC."

import React from 'react';
// import log from 'electron-log';
import useSearchQuery, { Options } from './use';
import SearchQuery from './Query';

export interface WithSearchQueryProps<Props, Results, QueryType extends SearchQuery<Props, Results>>
{
  results: Results[];
  loading: boolean;
  count: number;
  page: number;
  maxPage: number;

  prevPage: () => void;
  nextPage: () => void;
  goToPage: (p: number) => void;

  query: QueryType;
  parentQuery?: QueryType;
  setParentQuery: (sq: QueryType) => void;
}

// this with HMR might cause wdm to enter a recompile loop

// https://react-typescript-cheatsheet.netlify.app/docs/hoc/full_example
// usage: withSearchQuery(QueryObject, { ...UseFileSearchQueryOptions })(Component)
const withSearchQuery = <Props, Results, QueryType extends SearchQuery<Props, Results>>(QueryConstructor: new (q: Props | string, d?: number) => QueryType, options: Readonly<Options>) =>
<T extends WithSearchQueryProps<Props, Results, QueryType> = WithSearchQueryProps<Props, Results, QueryType>>(Component: React.ComponentType<T>) =>
{
  const displayName = Component.displayName || Component.name || "Component";

  const WrappedComponent: React.FC<Omit<T, keyof WithSearchQueryProps<Props, Results, QueryType>>> = (props: Omit<T, keyof WithSearchQueryProps<Props, Results, QueryType>>) => {
    //
    const [results, loading, count, page, maxPage, prevPage, nextPage, goToPage, query, parentQuery, setParentQuery] = useSearchQuery(QueryConstructor, options);

    return <Component {...(props as T)} results={results} loading={loading} count={count} page={page} maxPage={maxPage} prevPage={prevPage} nextPage={nextPage} goToPage={goToPage} query={query} parentQuery={parentQuery} setParentQuery={setParentQuery}/>;
  };

  WrappedComponent.displayName = `withSearchQuery(${displayName})`;

  return WrappedComponent;
}

export default withSearchQuery;
