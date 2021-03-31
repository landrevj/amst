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
  const c = <div className='inline-block px-1.5 py-1 bg-blue-400 rounded-l shadow'>{tag.category}</div>;
  const n = <div className={`inline-block px-1.5 py-1 bg-gray-300 ${tag.category ? 'rounded-r' : 'rounded'} shadow`}>{tag.name}</div>;

  return (
    <div className='m-1 select-none'>
      {!hideCategory && tag.category && c}
      {n}
      <button type="button" className='px-1 py-1 bg-transparent hover:text-red-500 cursor-pointer' onClick={() => { if(onRemove) onRemove(tag.id) }}>X</button>
    </div>
  );
}

TagButton.defaultProps = {
  hideCategory: false,
  onRemove: undefined,
};
