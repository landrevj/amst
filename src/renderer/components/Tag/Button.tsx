import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

import { TagStub } from '../../../db/entities';

interface TagButtonProps
{
  tag: TagStub;
  fontClassName?: string;
  highlighted?: boolean;
  hideCategory?: boolean;
  onRemove?: (id: number) => void;
}

export default function TagButton({ tag, fontClassName, highlighted, hideCategory, onRemove }: TagButtonProps)
{
  const c = <span className='inline-block pr-1 border-r-2 border-gray-300'>{tag.category}</span>;
  const n = <span className={`inline-block ${(!hideCategory && (tag.category !== '')) ? 'pl-1' : ''}`}>{tag.name}</span>;

  return (
    <div className={`m-0.5 px-2 max-w-full ${fontClassName} flex flex-row overflow-hidden rounded-full bg-gray-100 border-2 border-solid border-gray-300 ${highlighted && 'border-indigo-300 bg-indigo-100'}`}>
      <div className='inline-block overflow-hidden'>
        {!hideCategory && (tag.category !== '') && c}
        {n}
      </div>
      <FontAwesomeIcon className={`ml-1 -mr-1 my-auto fill-current text-gray-400 hover:text-red-500 ${highlighted && 'text-indigo-400'}`} icon={faTimesCircle} onClick={() => { if(onRemove) onRemove(tag.id) }}/>
    </div>
  );
}

TagButton.defaultProps = {
  hideCategory: false,
  fontClassName: 'text-sm',
  highlighted: false,
  onRemove: undefined,
};
