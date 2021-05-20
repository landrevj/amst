import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faFile, faHome, faLayerGroup, faSearch } from '@fortawesome/free-solid-svg-icons';
// import log from 'electron-log';

import useSearchQuery from '../../components/UI/Search/Query/use';
import FilePreviewList from '../../components/File/Preview/List';
import FileSearchForm from '../../components/File/Search/Form';
import PaginationButtons from '../../components/UI/Paginator/Buttons';
import { Card, CardHeader } from '../../components/UI/Card';
import PaginationPageInput from '../../components/UI/Paginator/PageInput';
import FileSearchQuery, { IFileSearchQuery } from '../../components/File/Search/Query';
import { PARENT_FILE_SEARCH_QUERY } from '../../SessionStorageKeys';
import { FileStub } from '../../../db/entities';

export default function FileSearch()
{
  const [results, loading, count, page, maxPage, prevPage, nextPage, goToPage, query,, setParentQuery] =
  useSearchQuery<IFileSearchQuery, FileStub, FileSearchQuery>(FileSearchQuery, {
    parentQuerySessionKey: PARENT_FILE_SEARCH_QUERY,
    defaultPerPage: 30
  });

  useEffect(() => setParentQuery(query), [query, setParentQuery]);

  const paginationWidth = 9;

  return (
    <div className='flex flex-row h-full p-4 space-x-4'>
      <div className='flex-none w-72'>

        <div className='flex flex-row -mb-1 bg-white bg-opacity-10 rounded-t'>
          <div className='text-gray-600 bg-white px-2 py-1 text-sm rounded-t space-x-2'>
            <FontAwesomeIcon icon={faFile}/>
            <span>files</span>
          </div>
          <Link className='text-gray-500 bg-gray-300 px-2 py-1 text-sm rounded-t space-x-2' to={`/group?workspaceID=${query.workspaceID || ''}&order=DESC`}>
            <FontAwesomeIcon icon={faLayerGroup}/>
          </Link>
        </div>

        <Card>
          <CardHeader icon={faSearch} text='search'/>
          <FileSearchForm query={query} files={results} resultCount={count}/>
        </Card>
      </div>

      <div className='flex-grow h-full flex flex-col space-y-4'>

        <Card flexDirection='row' className='flex-none px-4 py-2'>
          <Link className='flex-none flex flex-col justify-center rounded group text-gray-500 hover:text-blue-400 focus:outline-none focus:ring-4 ring-blue-200 ring-opacity-50' to='/'>
            <div className='space-x-2'>
              <FontAwesomeIcon className='group-hover:text-blue-400' icon={faChevronLeft}/>
              <FontAwesomeIcon className='group-hover:text-blue-400' icon={faHome}/>
            </div>
          </Link>
          <PaginationButtons className='flex-grow -my-2 mx-2' width={paginationWidth} page={page} maxPage={maxPage} prevPage={prevPage} nextPage={nextPage} goToPage={goToPage}/>
          <PaginationPageInput className='flex-none my-auto' currentPage={page} maxPage={maxPage} goToPage={goToPage}/>
        </Card>

        <Card empty={!loading && results.length === 0} className='flex-grow'>
          <FilePreviewList loading={loading} files={results} query={query} QueryConstructor={FileSearchQuery}/>
        </Card>

      </div>
    </div>
  );
};
