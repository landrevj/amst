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
    const key = tag.category || 'none';
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
    <div>
      {Object.entries(categories).sort().map(([category, catTags]) =>
        <div key={category}>
          <p>{category}</p>
          <hr/>
          <div className='flex flex-row flex-wrap'>
            {catTags.map(tag =>
            <TagButton tag={tag} onRemove={onTagRemove} hideCategory key={tag.id}/>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

TagList.defaultProps = {
  onTagRemove: undefined,
}
