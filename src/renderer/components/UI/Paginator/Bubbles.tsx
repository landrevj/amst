import { faAngleDoubleLeft, faAngleDoubleRight, faAngleLeft, faAngleRight, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

interface PaginationBubblesProps
{
  width?: number;

  page: number;
  maxPage: number;

  prevPage: () => void;
  nextPage: () => void;
  goToPage: (p: number) => void;
}

type BP = { className?: string, pageFn: () => void, inner: IconDefinition | string };
const Button: React.FC<BP> = ({ className, pageFn, inner }: BP) => {
  const c: JSX.Element | string = typeof inner === 'string' ? inner : <FontAwesomeIcon className='fill-current' icon={inner}/>;
  return (
    <button type='button' className={`px-2 py-0.5 min-w-sm text-center ${className}`} onClick={pageFn}>
      {c}
    </button>
  );
}
Button.defaultProps = { className: '' };

export default function PaginationBubbles({ width, page, maxPage, prevPage, nextPage, goToPage }: PaginationBubblesProps)
{
  const t = (width || PaginationBubbles.defaultProps.width);
  const w = Math.min(t, maxPage + 1);
  const hw = Math.trunc(w / 2);
  let pageArr: number[] = Array(w);
  // generate our array of pages surrounding the current page
  // e.g. if page=4 then pageArr should = [2,3,4,5,6] if width = 5 or [1,2,3,4,5,6] for 6
  //      if page=maxPage pageArr should just be an incremental array ending at maxPage
  const maxStartPage = (maxPage - w) + 1;
  if (page >= maxStartPage + hw)
  {
    for (let i = maxStartPage; i <= maxPage; i += 1) pageArr[i] = i;
  }
  else
  {
    const startPage = page - hw; // calculate the leftmost value in the pageArr
    for (let i = 0; i < w; i += 1) pageArr[i] = i + startPage; // fill the array starting from there
    // if startPage was negative then shift the whole array up by abs(that) so the array starts from 0, e.g. page={0-2}, width=5 => [0,1,2,3,4]
    if (startPage < 0) pageArr = pageArr.map(e => e + (startPage * -1));
  }

  const maxPageGreaterThanWidth = maxPage > t;

  return (
    <div className='flex flex-row justify-center'>
      <Button className={`bg-transparent text-gray-500 ${(page > hw) && maxPageGreaterThanWidth ? '' : 'invisible'}`} pageFn={() => goToPage(0)} inner={faAngleDoubleLeft}/>
      <Button className='bg-transparent text-gray-500' pageFn={prevPage} inner={faAngleLeft}/>

      <div className='space-x-1'>
        {pageArr.map(p => <Button className={`rounded-full text-sm ${p === page ? 'bg-blue-200' : ''}`} pageFn={() => { if (p !== page) goToPage(p) }} inner={(p + 1).toString()} key={p}/>)}
      </div>

      <Button className='bg-transparent text-gray-500' pageFn={nextPage} inner={faAngleRight}/>
      <Button className={`bg-transparent text-gray-500 ${(page < maxPage - hw) && maxPageGreaterThanWidth ? '' : 'invisible'}`} pageFn={() => goToPage(maxPage)} inner={faAngleDoubleRight}/>
    </div>
  );
}

PaginationBubbles.defaultProps = { width: 5 };
