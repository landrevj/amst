import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
// import log from 'electron-log';

import useFileSearchQuery from '../../components/File/useFileSearchQuery';
import FilePreviewList from '../../components/File/Preview/List';
import FileSearchPanel from '../../components/File/Search/Panel';
import PaginationBubbles from '../../components/UI/Paginator/Bubbles';

// eslint-disable-next-line import/prefer-default-export
function FileSearch()
{
  const [files, count, page, maxPage, prevPage, nextPage, goToPage, query] = useFileSearchQuery({ defaultFilesPerPage: 30 });

  const paginationWidth = 9;
  const pagination = <PaginationBubbles width={paginationWidth} page={page} maxPage={maxPage} prevPage={prevPage} nextPage={nextPage} goToPage={goToPage}/>;

  return (
    <div className='flex flex-row h-screen'>
      <FileSearchPanel query={query} files={files} resultCount={count}/>

      <div className='flex-grow h-full overflow-y-auto relative p-3'>
        <Link className='absolute left-3' to='/'>
          <FontAwesomeIcon className='mr-2 fill-current text-gray-600' icon={faChevronLeft}/>home
        </Link>
        <span className='absolute right-3'>{page + 1}/{maxPage + 1}</span>

        {pagination}
        <FilePreviewList className='my-2 rounded' files={files} query={query}/>
        {pagination}

      </div>
    </div>
  );
};

export default FileSearch;
