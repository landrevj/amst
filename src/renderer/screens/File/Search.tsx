import React from 'react';
import { Link } from 'react-router-dom';
// import log from 'electron-log';

import useFileSearchQuery from '../../components/File/useFileSearchQuery';
import FilePreviewList from '../../components/File/Preview/List';
import FileSearchPanel from '../../components/File/Search/Panel';

// eslint-disable-next-line import/prefer-default-export
function FileSearch()
{
  const [files, count, page, maxPage, prevPage, nextPage, query] = useFileSearchQuery();

  const prevPageLink = page > 0       ? (<button type='button' className='px-2 py-1 bg-blue-100 rounded' onClick={prevPage}>prev</button>) : (<span className='px-2 py-1 bg-gray-200 rounded'>prev</span>);
  const nextPageLink = page < maxPage ? (<button type='button' className='px-2 py-1 bg-blue-200 rounded' onClick={nextPage}>next</button>) : (<span className='px-2 py-1 bg-gray-200 rounded'>next</span>);

  return (
    <div className='flex flex-row h-screen'>
      <FileSearchPanel query={query} files={files}/>
      <div className='flex-grow h-full overflow-y-auto'>
        <Link to='/'>Home</Link>
        <div className='space-x-1.5 p-4'>
          <span>Page {page + 1} of {maxPage + 1}</span>
          {prevPageLink}
          {nextPageLink}

          <span>({count} results)</span>
        </div>
        <FilePreviewList files={files} />
      </div>
    </div>
  );
};

export default FileSearch;
