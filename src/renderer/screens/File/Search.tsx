import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
// import log from 'electron-log';

import useFileSearchQuery from '../../components/File/Search/Query/use';
import FilePreviewList from '../../components/File/Preview/List';
import FileSearchPanel from '../../components/File/Search/Panel';
import PaginationBubbles from '../../components/UI/Paginator/Bubbles';
import ClickToEditInput from '../../components/UI/ClickToEdit/Input';

// eslint-disable-next-line import/prefer-default-export
function FileSearch()
{
  const [files, count, page, maxPage, prevPage, nextPage, goToPage, query] = useFileSearchQuery({ defaultFilesPerPage: 30 });

  const paginationWidth = 9;
  const pagination = <PaginationBubbles className='flex-grow' width={paginationWidth} page={page} maxPage={maxPage} prevPage={prevPage} nextPage={nextPage} goToPage={goToPage}/>;

  return (
    <div className='flex flex-row h-screen'>
      <FileSearchPanel query={query} files={files} resultCount={count}/>

      <div className='flex-grow h-full overflow-y-auto relative p-3'>

        <div className='flex flex-row'>
          <Link className='flex-none block rounded group hover:text-blue-400 focus:outline-none focus:ring-4 ring-blue-200 ring-opacity-50' to='/'>
            <FontAwesomeIcon className='mr-2 fill-current text-gray-600 group-hover:text-blue-400' icon={faChevronLeft}/>home
          </Link>
          {pagination}
          <div className='flex-none space-x-1'>

            <ClickToEditInput
              inputClassName='text-right'
              buttonClassName='text-gray-400 hover:text-blue-400'
              type='text'
              value={(page + 1).toString()}
              onSave={(value: string) => goToPage(parseInt(value, 10) - 1)}
              onValidateSave={(value: string) => {
                const p = parseInt(value, 10 );
                if (value !== '' && (p > 0 && p <= maxPage + 1)) return true;
                return false;
              }}
              onValidateChange={(value: string) => {
                const p = parseInt(value, 10 );
                if (value === '' || (value.match(/^\d+$/) && p > 0 && p <= maxPage + 1)) return true;
                return false;
              }}
              useContentWidth/>

            <span>/</span>
            <span>{maxPage + 1}</span>
          </div>
        </div>

        <FilePreviewList className='my-2 rounded' files={files} query={query}/>
        {pagination}

      </div>
    </div>
  );
};

export default FileSearch;
