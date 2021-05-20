import React from 'react';
import { sample, random } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan } from '@fortawesome/free-solid-svg-icons';

import { TagStub } from '../../../db/entities';
import { compareStrings } from '../../../utils';

import TagButton from './Button';
import { TagCategoryObject, TagTuple } from './index';

const NONE_CATEGORY_TEXT = ' '; // https://emptycharacter.com - three-per-em space - we use this to give the category bubble some height

interface TagListProps
{
  tags: TagStub[];
  searchTagTuples?: TagTuple[]; // special tags to highlight, e.g. you could provide tags used in a search and the list will highlight those tags if they show up
  handleTagRemove?: (id: number) => void;
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

export default function TagList({ tags, searchTagTuples, handleTagRemove, loading }: TagListProps)
{
  if (loading)
  {
    const widths = ['w-12', 'w-14', 'w-16', 'w-20', 'w-24', 'w-28'];

    return (
      <div className='animate-fade-in flex flex-col gap-1'>
        {Array(3).fill('').map((_, i) =>
          // eslint-disable-next-line react/no-array-index-key
          <div className='flex flex-row' key={i}>
            <div className='flex-grow flex flex-row flex-wrap overflow-hidden gap-1'>
              <div className={`text-base-loading inline-block filter saturate-[.9] bg-gradient-to-r from-blue-400 to-blue-300 ${sample(widths)}`}/>
              {Array(random(1,5)).fill('').map((_e, j) =>
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

  return categories.length ? (
    <div className='flex flex-col gap-1'>
      {categories.map(([category, catTags]) =>
      <div className='flex flex-row gap-1' key={category}>
        <div className='max-w-[50%]'>
          <div className='max-w-full overflow-hidden overflow-ellipsis px-2 py-0.5 text-sm text-center rounded-full text-white filter saturate-[.9] bg-gradient-to-r from-blue-400 to-blue-300'>
            {category === NONE_CATEGORY_TEXT ?
              <span className='flex place-items-center h-5'><FontAwesomeIcon icon={faBan}/></span>
            : category}
          </div>
        </div>
        <div className='flex-grow flex flex-row flex-wrap overflow-hidden gap-1'>
          {catTags.map(tag =>
          <TagButton tag={tag} highlighted={!!searchTagTuples?.find(t => tagTupleEqualsStub(t, tag))} onRemove={handleTagRemove} hideCategory key={tag.id}/>
          )}
        </div>
      </div>)}
    </div>
  ) : <></>;
}

TagList.defaultProps = {
  searchTagTuples: undefined,
  handleTagRemove: undefined,
  loading: undefined,
}
