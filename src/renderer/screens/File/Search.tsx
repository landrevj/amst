import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faHome, faSearch } from '@fortawesome/free-solid-svg-icons';
// import log from 'electron-log';

import useFileSearchQuery from '../../components/File/Search/Query/use';
import FilePreviewList from '../../components/File/Preview/List';
import FileSearchForm from '../../components/File/Search/Form';
import PaginationButtons from '../../components/UI/Paginator/Buttons';
import { Card } from '../../components/UI/Card';
import PaginationPageInput from '../../components/UI/Paginator/PageInput';

// eslint-disable-next-line import/prefer-default-export
export default function FileSearch()
{
  const [files, count, page, maxPage, prevPage, nextPage, goToPage, query] = useFileSearchQuery({ defaultFilesPerPage: 30 });

  const paginationWidth = 9;

  return (
    <div className='flex flex-row h-full p-4 space-x-4'>
      <div className='flex-none w-72'>
        <Card icon={faSearch} text='search'>
          <FileSearchForm query={query} files={files} resultCount={count}/>
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

        <FilePreviewList className='flex-grow max-h-full overflow-auto p-4 rounded bg-white' files={files} query={query}/>

      </div>
    </div>
  );
};
