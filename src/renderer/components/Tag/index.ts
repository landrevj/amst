import { TagStub } from "../../../db/entities";

export interface TagCategoryObject
{
  [category: string]: TagStub[];
}

export function tagRegex(input: string, allowReservedCategoryPrefixes?: boolean): TagTuple
{
  const re = /^(?![*!])([^:]+):?([^:]+)?$/;
  const reWithRes = /^([^:]+):?([^:]+)?$/;
  const match = input.match(allowReservedCategoryPrefixes ? reWithRes : re); // match one can be either the tag or category, match two is always the tag if its there
  if (input === '')
  {
    return ['', ''];
  }

  if (match)
  {
    // if there was something in the tag group use that, otherwise use what was in the category group instead
    const tag = match[2] || match[1];
    // if there was something in the tag group we can use the value from the category group as our category value
    // otherwise we didn't get both a category and a tag, so we just use the empty string for our category.
    const category = match[2] ? match[1] : '';

    return [tag, category];
  }

  return ['', ''];
}

export type TagTuple = [string, string]; // first one is the name, second is the category
