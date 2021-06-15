import { faArrowCircleUp, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Link } from 'react-router-dom';

import PaginationPageInput from '../../Paginator/PageInput';

interface QueryNavProps
{
  id?: number;
  page?: number;
  maxPage?: number;
  prevPage?: () => void;
  nextPage?: () => void;
  goToPage?: (p: number) => void;
  backPath?: string;

  loading?: boolean;
}

export default function QueryNav({ id, page, maxPage, prevPage, nextPage, goToPage, backPath, loading }: QueryNavProps)
{

  return loading ? (
    <div className='flex flex-row animate-fade-in place-items-center gap-2'>
      <div className='!bg-gray-400 text-sm-loading w-14'/>
      <div className='flex-grow'/>
      <div className='!bg-gray-400 text-sm-loading w-14'/>
      <div className='!bg-gray-400 text-sm-loading w-14'/>
    </div>
  ) : (
    <nav className='flex flex-row gap-2'>
      {id && <span>#{id}</span>}
      {(goToPage && typeof page === 'number' && typeof maxPage === 'number' && maxPage > 0) &&
        <PaginationPageInput className='text-gray-400' currentPage={page} maxPage={maxPage} goToPage={goToPage}/>
      }

      <div className='flex-grow'/>

      {(prevPage && typeof maxPage === 'number' && maxPage > 1) &&
      <button type='button' className='h-6 bg-transparent flex place-items-center' onClick={prevPage}>
        <FontAwesomeIcon className='mr-2 fill-current text-gray-600' icon={faChevronLeft}/>
        <span>prev</span>
      </button>}

      {backPath &&
      <Link to={backPath} type='button' className='flex px-2 rounded-full text-white filter saturate-[.9] bg-gradient-to-r from-blue-400 to-blue-300'>
        <FontAwesomeIcon className='mr-1 -ml-1 my-auto fill-current text-gray-100' icon={faArrowCircleUp}/>
        <span>back</span>
      </Link>}

      {(nextPage && typeof maxPage === 'number' && maxPage > 1) &&
      <button type='button' className='h-6 bg-transparent flex place-items-center' onClick={nextPage}>
        <span>next</span>
        <FontAwesomeIcon className='ml-2 fill-current text-gray-600' icon={faChevronRight}/>
      </button>}
    </nav>
  );
}

QueryNav.defaultProps = {
  id: undefined,
  page: undefined,
  maxPage: undefined,
  prevPage: undefined,
  nextPage: undefined,
  goToPage: undefined,
  backPath: undefined,
  loading: undefined,
};
