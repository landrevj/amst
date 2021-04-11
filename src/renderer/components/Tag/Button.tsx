import React from 'react';
import { TagStub } from '../../../db/entities';

interface TagButtonProps
{
  tag: TagStub;
  hideCategory?: boolean;
  onRemove?: (id: number) => void;
}


export default function TagButton({ tag, hideCategory, onRemove }: TagButtonProps)
{
  const c = <div className='inline-block pr-1 border-r-2 border-gray-300'>{tag.category}</div>;
  const n = <div className={`inline-block ${(!hideCategory && tag.category) ? 'pl-1' : ''}`}>{tag.name}</div>;

  return (
    <div className='m-0.5 px-2 text-sm rounded-full bg-gray-100 border-2 border-solid border-gray-300'>
      {!hideCategory && tag.category && c}
      {n}
      <button type="button" className='px-0 py-0 ml-2 bg-transparent hover:text-red-500 cursor-pointer' onClick={() => { if(onRemove) onRemove(tag.id) }}>x</button>
    </div>
  );
}

TagButton.defaultProps = {
  hideCategory: false,
  onRemove: undefined,
};
