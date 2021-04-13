import React from 'react';

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
  return (catOrEmptyString === stub.category && name === stub.name);
}

export default function TagList({ tags, searchTagTuples, onTagRemove }: TagListProps)
{
  // make array of [string, TagTuple[]], sort it with a locale aware string comparison fn, and move the one with string === NONE_CATEGORY_TEXT to the end
  const categories = Object.entries(coalesceTags(tags)).sort((a, b) => a[0].localeCompare(b[0]));
  const noneCategoryIndex = categories.findIndex(c => c[0] === NONE_CATEGORY_TEXT);
  const noneCategory = noneCategoryIndex !== -1 ? categories.splice(noneCategoryIndex, 1)[0] : undefined;
  if (noneCategory) categories.push(noneCategory);

  return (
    <table className='table-auto'>
      <tbody>
        {categories.map(([category, catTags]) =>
          <tr key={category}>
            <td className='align-text-top text-right'>
              <span className='inline-block px-2 text-sm text-center rounded-full bg-blue-200 border-2 border-solid border-blue-200 overflow-ellipsis'>{category}</span>
            </td>
            <td className='align-middle'>
              <div className='flex flex-row flex-wrap'>
                {catTags.map(tag => {
                const borderColor = searchTagTuples?.find(t => tagTupleEqualsStub(t, tag)) ? 'border-indigo-300 bg-indigo-100' : '';
                return <TagButton tag={tag} highlightClassName={borderColor} onRemove={onTagRemove} hideCategory key={tag.id}/>;
                })}
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

TagList.defaultProps = {
  searchTagTuples: undefined,
  onTagRemove: undefined,
}
