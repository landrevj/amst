import React from 'react';

import { TagStub } from '../../../db/entities';
import { compareStrings } from '../../../utils';

import TagButton from './Button';
import { TagCategoryObject } from './index';

interface TagListProps
{
  tags: TagStub[];
  onTagRemove?: (id: number) => void;
}

function coalesceTags(tags: TagStub[]): TagCategoryObject
{
  const cats: TagCategoryObject = {};
  tags.forEach(tag => {
    const key = tag.category !== '' ? tag.category : 'none';
    if (!cats[key]) cats[key] = [];
    cats[key].push(tag);
  })
  Object.entries(cats).forEach(cat => cat[1].sort((a, b) => compareStrings(a.name, b.name)));
  return cats;
}

export default function TagList({ tags, onTagRemove }: TagListProps)
{
  const categories = coalesceTags(tags);

  return (
    <table className='table-auto'>
      <tbody>
        {Object.entries(categories).sort().map(([category, catTags]) =>
          <tr key={category}>
            <td className='align-text-top text-right'>
              <div className='inline-block px-2 text-sm rounded-full bg-blue-200 border-2 border-solid border-blue-200'>{category}</div>
            </td>
            <td className='flex flex-row flex-wrap'>
              {catTags.map(tag =>
              <TagButton tag={tag} onRemove={onTagRemove} hideCategory key={tag.id}/>
              )}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

TagList.defaultProps = {
  onTagRemove: undefined,
}
