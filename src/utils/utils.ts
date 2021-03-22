/* eslint-disable no-bitwise */
/* eslint-disable no-continue */
import fg, { Entry } from 'fast-glob';

export function isNumberArray(value: unknown): value is number[]
{
  return Array.isArray(value) && value.every(item => typeof item === "number");
}

export function glob(folder: string, pattern?: string): Promise<Entry[]>
export function glob(folders: string[], pattern?: string): Promise<Entry[]>[]
export function glob(folders: string | string[], pattern = '**/*'): Promise<Entry[]> | Promise<Entry[]>[]
{
  if (!Array.isArray(folders))
  {
    return fg(pattern, {
      cwd: folders,
      absolute: true,
      onlyFiles: true,
      objectMode: true,
      unique: true,
      suppressErrors: true,
    });
  }

  const promises: Promise<Entry[]>[] = [];
  folders.forEach(folder => {
    promises.push(
      fg(pattern, {
        cwd: folder,
        absolute: true,
        onlyFiles: true,
        objectMode: true,
        unique: true,
        suppressErrors: true,
      })
    );
  });
  return promises;
}

/**
 * Extracts a file extension from the given filename if it has one.
 * @see https://stackoverflow.com/a/12900504
 * @param fname Filename (no paths)
 * @returns The extracted extension if there was one, empty string otherwise.
 * ""                            -->   ""
 * "name"                        -->   ""
 * "name.txt"                    -->   "txt"
 * ".htpasswd"                   -->   ""
 * "name.with.many.dots.myext"   -->   "myext"
 */
export function filenameExtension(fname: string)
{
  return fname.slice((fname.lastIndexOf(".") - 1 >>> 0) + 2);
}

// @see https://codeburst.io/optimizing-array-analytics-in-javascript-part-two-search-intersection-and-cross-products-79b4a6d68da0
export function arrayIntersection<T>(...arrays: T[][])
{
  // if we process the arrays from shortest to longest
  // then we will identify failure points faster, i.e. when
  // one item is not in all arrays
  const ordered = (arrays.length === 1 ? arrays : arrays.sort((a1,a2) => a1.length - a2.length));
  const shortest = ordered[0];
  const set = new Set(); // used for bookeeping, Sets are faster
  const result = []; // the intersection, conversion from Set is slow
  // for each item in the shortest array
  for (let i = 0; i < shortest.length; i += 1)
  {
    const item = shortest[i];
    // see if item is in every subsequent array
    let every = true; // don't use ordered.every ... it is slow
    for (let j = 1; j < ordered.length; j += 1)
    {
      if (ordered[j].includes(item)) continue;
      every = false;
      break;
    }
    // ignore if not in every other array, or if already captured
    if (!every || set.has(item)) continue;
    // otherwise, add to bookeeping set and the result
    set.add(item);
    result[result.length] = item;
  }
  return result;
}

export function arrayDifference<T, U>(arr1: T[], arr2: U[], equals: (a: T, b: U) => boolean): T[]
{
  // might be able to speed this up by building a dictionary/set of arr2 at the start,
  // and checking if the dictionary contains itemA's key instead of iterating over arr2 for each item.
  // would have to pass in some function which gets some key from the item which can be compared with ===
  // instead of an equals function.

  const result: T[] = [];
  for (let i = 0; i < arr1.length; i += 1)
  {
    const itemA = arr1[i];

    let contained = false;
    for (let j = 0; j < arr2.length; j += 1)
    {
      const itemB = arr2[j];
      if (equals(itemA, itemB))
      {
        contained = true;
        break;
      }
    }

    if (contained) continue;

    result[result.length] = itemA;
  }
  return result;
}

