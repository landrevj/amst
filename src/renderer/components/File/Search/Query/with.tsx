/* eslint-disable react/jsx-props-no-spreading */
// "When Not To Use It: ...or the props spreading is used inside HOC."

import React from 'react';
// import log from 'electron-log';

import FileSearchQuery from './Query';
import { FileStub } from '../../../../../db/entities';
import useFileSearchQuery, { Options } from './use';

export interface WithFileSearchQueryProps
{
  files: FileStub[];
  count: number;
  page: number;
  maxPage: number;

  prevPage: () => void;
  nextPage: () => void;
  goToPage: (p: number) => void;

  query: FileSearchQuery;
  parentQuery?: FileSearchQuery;
}

// TODO: this with HMR might cause wdm to enter a recompile loop

// https://react-typescript-cheatsheet.netlify.app/docs/hoc/full_example
// usage: withFileSearchQuery({ ...UseFileSearchQueryOptions })(Component)
const withFileSearchQuery = (options: Readonly<Options>) => <T extends WithFileSearchQueryProps = WithFileSearchQueryProps>(Component: React.ComponentType<T>) =>
{
  const displayName = Component.displayName || Component.name || "Component";

  const WrappedComponent: React.FC<Omit<T, keyof WithFileSearchQueryProps>> = (props: Omit<T, keyof WithFileSearchQueryProps>) => {
    //
    const [files, count, page, maxPage, prevPage, nextPage, goToPage, query, parentQuery] = useFileSearchQuery(options);

    return <Component {...(props as T)} files={files} count={count} page={page} maxPage={maxPage} prevPage={prevPage} nextPage={nextPage} goToPage={goToPage} query={query} parentQuery={parentQuery}/>;
  };

  WrappedComponent.displayName = `withFileSearchQuery(${displayName})`;

  return WrappedComponent;
}

export default withFileSearchQuery;
