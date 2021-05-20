/* eslint-disable react/jsx-props-no-spreading */
// "When Not To Use It: ...or the props spreading is used inside HOC."

import { useState, useEffect, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { SearchQuery } from './Query';

export interface Options
{
  parentQuerySessionKey: string;
  // how many files appear in one page of a search
  defaultPerPage?: number;
}

export interface SearchQueryProps<Props, Results, QueryType extends SearchQuery<Props, Results>>
{
  results:        Results[];
  loading:        boolean;
  count:          number;
  page:           number;
  maxPage:        number;
  prevPage:       () => void;
  nextPage:       () => void;
  goToPage:       (p: number) => void;
  query:          QueryType;
  parentQuery:    QueryType | undefined;
  setParentQuery: (sq: QueryType) => void;
};

export default function useSearchQuery
<Props, Results, QueryType extends SearchQuery<Props, Results>>
(QueryConstructor: new (q: Props | string, d?: number) => QueryType, options: Readonly<Options>)
: SearchQueryProps<Props, Results, QueryType>
{
  const location = useLocation();

  const sessionQueryString = window.sessionStorage.getItem(options.parentQuerySessionKey);
  const [parentQuery] = useState<QueryType | undefined>(sessionQueryString ? new QueryConstructor(JSON.parse(sessionQueryString)) : undefined);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Results[]>([]);
  const [count,   setCount]   = useState(0);
  const [page,    setPage]    = useState(0);
  const [maxPage, setMaxPage] = useState(0);

  const query = useMemo(() => new QueryConstructor(location.search, options.defaultPerPage),
  [QueryConstructor, location.search, options.defaultPerPage]);

  useEffect(() => {
    async function loadResults()
    {
      setLoading(true);

      const [newResults, newCount] = await query.getResults();

      setResults(newResults);
      setCount(newCount || 0);
      setPage(query.page || 0);
      // compute the length of the 'search results array' and then subtract one to get the largest index
      setMaxPage(Math.ceil((newCount || 0) / (query.limit || options.defaultPerPage || 20)) - 1);
      setLoading(false);
    }
    loadResults();
  }, [query, options.defaultPerPage]);


  const history = useHistory();
  const prevPage = () => {
    if (page <= 0) return;

    const pqs = new QueryConstructor(query.props);
    pqs.page = page - 1;
    history.push(`${location.pathname}?${pqs}`);
  };
  const nextPage = () => {
    if (page >= maxPage) return;

    const nqs = new QueryConstructor(query.props);
    nqs.page = page + 1;
    history.push(`${location.pathname}?${nqs}`);
  };
  const goToPage = (p: number) => {
    const sqs = new QueryConstructor(query.props);
    sqs.page = p;
    history.push(`${location.pathname}?${sqs}`);
  };

  const setParentQuery = (sq: QueryType) => window.sessionStorage.setItem(options.parentQuerySessionKey, JSON.stringify(sq));

  return { results, loading, count, page, maxPage, prevPage, nextPage, goToPage, query, parentQuery, setParentQuery };
}
