/* eslint-disable react/jsx-props-no-spreading */
// "When Not To Use It: ...or the props spreading is used inside HOC."

import { useState, useEffect, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import SearchQuery from './Query';

export interface Options
{
  parentQuerySessionKey: string;
  // how many files appear in one page of a search
  defaultFilesPerPage?: number;
}

export default function useSearchQuery<Props, Results, QueryType extends SearchQuery<Props, Results>>(QueryObject: new (q: Props | string, d?: number) => QueryType, options: Readonly<Options>)
: [Results[], boolean, number, number, number, () => void, () => void, (p: number) => void, QueryType, QueryType | undefined, (sq: QueryType) => void]
{
  const location = useLocation();

  const sessionQueryString = window.sessionStorage.getItem(options.parentQuerySessionKey);
  const [parentQuery] = useState<QueryType | undefined>(sessionQueryString ? new QueryObject(JSON.parse(sessionQueryString)) : undefined);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Results[]>([]);
  const [count,   setCount]   = useState(0);
  const [page,    setPage]    = useState(0);
  const [maxPage, setMaxPage] = useState(0);

  const query = useMemo(() => new QueryObject(location.search, options.defaultFilesPerPage), [location.search, options.defaultFilesPerPage, QueryObject]);

  useEffect(() => {
    async function loadResults()
    {
      setLoading(true);

      const [newResults, newCount] = await query.getResults();

      setResults(newResults);
      setCount(newCount || 0);
      setPage(query.page || 0);
      // compute the length of the 'search results array' and then subtract one to get the largest index
      setMaxPage(Math.ceil((newCount || 0) / (query.limit || options.defaultFilesPerPage || 20)) - 1);
      setLoading(false);
    }
    loadResults();
  }, [query, options.defaultFilesPerPage]);


  const history = useHistory();
  const prevPage = () => {
    if (page <= 0) return;

    const pqs = new QueryObject(query.props);
    pqs.page = page - 1;
    history.push(`${location.pathname}?${pqs}`);
  };
  const nextPage = () => {
    if (page >= maxPage) return;

    const nqs = new QueryObject(query.props);
    nqs.page = page + 1;
    history.push(`${location.pathname}?${nqs}`);
  };
  const goToPage = (p: number) => {
    const sqs = new QueryObject(query.props);
    sqs.page = p;
    history.push(`${location.pathname}?${sqs}`);
  };

  const setParentQuery = (sq: QueryType) => window.sessionStorage.setItem(options.parentQuerySessionKey, JSON.stringify(sq));

  return [results, loading, count, page, maxPage, prevPage, nextPage, goToPage, query, parentQuery, setParentQuery];
}
