import { faArrowCircleUp, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Link } from 'react-router-dom';

interface QueryNavProps
{
  id?: number;
  page?: number;
  maxPage?: number;
  prevPage?: () => void;
  nextPage?: () => void;
  backPath?: string;

  loading?: boolean;
}

export default function QueryNav({ id, page, maxPage, prevPage, nextPage, backPath, loading }: QueryNavProps)
{

  return loading ? (
    <div className='flex flex-row animate-fade-in place-items-center gap-2'>
      <div className='!bg-gray-400 text-sm-loading w-14'/>
      <div className='flex-grow'/>
      <div className='!bg-gray-400 text-sm-loading w-14'/>
      <div className='!bg-gray-400 text-sm-loading w-14'/>
    </div>
  ) : (
    <div className='flex flex-row gap-2'>
      {id && <span>#{id}</span>}
      {(typeof page === 'number' && typeof maxPage === 'number' && maxPage > 0) && <span className='text-gray-400'>{page + 1}/{maxPage + 1}</span>}

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
    </div>
  );
}

QueryNav.defaultProps = {
  id: undefined,
  page: undefined,
  maxPage: undefined,
  prevPage: undefined,
  nextPage: undefined,
  backPath: undefined,
  loading: undefined,
};
