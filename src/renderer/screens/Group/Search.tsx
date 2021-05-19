import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faFile, faHome, faLayerGroup, faSearch } from '@fortawesome/free-solid-svg-icons';
// import log from 'electron-log';

import useSearchQuery from '../../components/UI/Search/Query/use';
import GroupSearchForm from '../../components/Group/Search/Form';
import PaginationButtons from '../../components/UI/Paginator/Buttons';
import { Card, CardHeader } from '../../components/UI/Card';
import PaginationPageInput from '../../components/UI/Paginator/PageInput';
import GroupSearchQuery, { IGroupSearchQuery } from '../../components/Group/Search/Query';
import { PARENT_GROUP_SEARCH_QUERY } from '../../SessionStorageKeys';
import { GroupStub } from '../../../db/entities';
import GroupPreviewList from '../../components/Group/Preview/List';

export default function GroupSearch()
{
  const [results, loading, count, page, maxPage, prevPage, nextPage, goToPage, query,, setParentQuery] = useSearchQuery<IGroupSearchQuery, GroupStub, GroupSearchQuery>(GroupSearchQuery, { parentQuerySessionKey: PARENT_GROUP_SEARCH_QUERY, defaultPerPage: 30 });

  setParentQuery(query);

  const paginationWidth = 9;

  return (
    <div className='flex flex-row h-full p-4 space-x-4'>
      <div className='flex-none w-72'>

        <div className='flex flex-row -mb-1 bg-white bg-opacity-10 rounded-t'>
          <Link className='text-gray-500 bg-gray-300 px-2 py-1 text-sm rounded-t space-x-2' to={`/file?workspaceID=${query.workspaceID || ''}`} >
            <FontAwesomeIcon icon={faFile}/>
          </Link>
          <div className='text-gray-600 bg-white px-2 py-1 text-sm rounded-t space-x-2'>
            <FontAwesomeIcon icon={faLayerGroup}/>
            <span>groups</span>
          </div>
        </div>

        <Card>
          <CardHeader icon={faSearch} text='search'/>
          <GroupSearchForm query={query} groups={results} resultCount={count}/>
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
          <GroupPreviewList loading={loading} groups={results} query={query}/>
        </Card>

      </div>
    </div>
  );
};
