import React from 'react';
import { sample, random } from 'lodash';

import { TagStub } from '../../../db/entities';
import { compareStrings } from '../../../utils';

import TagButton from './Button';
import { TagCategoryObject, TagTuple } from './index';

const NONE_CATEGORY_TEXT = ' '; // https://emptycharacter.com - three-per-em space - we use this to give the category bubble some height

interface TagListProps
{
  tags: TagStub[];
  searchTagTuples?: TagTuple[]; // special tags to highlight, e.g. you could provide tags used in a search and the list will highlight those tags if they show up
  onTagRemove?: (id: number) => void;
  loading?: boolean;
}

function coalesceTags(tags: TagStub[]): TagCategoryObject
{
  const cats: TagCategoryObject = {};
  tags.forEach(tag => {
    const key = tag.category !== '' ? tag.category : NONE_CATEGORY_TEXT;
    if (!cats[key]) cats[key] = [];
    cats[key].push(tag);
  })
  Object.entries(cats).forEach(cat => cat[1].sort((a, b) => compareStrings(a.name, b.name)));
  return cats;
}

function tagTupleEqualsStub(tuple: TagTuple, stub: TagStub)
{
  const [name, catOrEmptyString] = tuple;
  return ((catOrEmptyString === '' || catOrEmptyString === stub.category) && name === stub.name);
}

export default function TagList({ tags, searchTagTuples, onTagRemove, loading }: TagListProps)
{
  if (loading)
  {
    const widths = ['w-16', 'w-20', 'w-24', 'w-28', 'w-32'];

    return (
      <div className='animate-fade-in'>
        {Array(3).fill('').map((_, i) =>
          // eslint-disable-next-line react/no-array-index-key
          <div className='flex flex-row mb-2' key={i}>
            <div className='flex-grow flex flex-row flex-wrap overflow-hidden gap-2 w-'>
              <div className={`text-base-loading inline-block !bg-blue-200 ${sample(widths)}`}/>
              {Array(random(1,10)).fill('').map((_e, j) =>
                // eslint-disable-next-line react/no-array-index-key
                <div className={`text-base-loading inline-block ${sample(widths)}`} key={j}/>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // make array of [string, TagTuple[]], sort it with a locale aware string comparison fn, and move the one with string === NONE_CATEGORY_TEXT to the end
  const categories = Object.entries(coalesceTags(tags)).sort((a, b) => a[0].localeCompare(b[0]));
  const noneCategoryIndex = categories.findIndex(c => c[0] === NONE_CATEGORY_TEXT);
  const noneCategory = noneCategoryIndex !== -1 ? categories.splice(noneCategoryIndex, 1)[0] : undefined;
  if (noneCategory) categories.push(noneCategory);

  return (
    <div>
      {categories.map(([category, catTags]) =>
      <div className='flex flex-row' key={category}>
        <div className='max-w-[50%]'>
          <div className='m-0.5 max-w-full overflow-hidden overflow-ellipsis px-2 text-sm text-center rounded-full bg-blue-200 border-2 border-solid border-blue-200'>{category}</div>
        </div>
        <div className='flex-grow flex flex-row flex-wrap overflow-hidden'>
          {catTags.map(tag =>
          <TagButton tag={tag} highlighted={!!searchTagTuples?.find(t => tagTupleEqualsStub(t, tag))} onRemove={onTagRemove} hideCategory key={tag.id}/>
          )}
        </div>
      </div>)}
    </div>
  );
}

TagList.defaultProps = {
  searchTagTuples: undefined,
  onTagRemove: undefined,
  loading: undefined,
}
