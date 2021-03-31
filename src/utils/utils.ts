/* eslint-disable no-bitwise */
/* eslint-disable no-continue */
import fg, { Entry } from 'fast-glob';

/**
 * Used to narrow type of a variable which might be an array of numbers.
 * Probably slow for large arrays.
 * @param value Variable to check type of.
 * @returns Whether or not value was an array of numbers.
 */
export function isNumberArray(value: unknown): value is number[]
{
  return Array.isArray(value) && value.every(item => typeof item === "number");
}

/**
 * Uses a glob pattern to recursively search the provided path for files.
 * @param folder The folder to search recursively for files.
 * @param pattern The glob pattern to use when searching.
 */
export function glob(folder: string, pattern?: string): Promise<Entry[]>
/**
 * Uses a glob pattern to recursively search each of the provided folders for files.
 * @param folders Array of folders to search recursively for files.
 * @param pattern The glob pattern to use when searching.
 */
export function glob(folders: string[], pattern?: string): Promise<Entry[]>[]
/**
 * Uses a glob pattern to recursively search each of the provided folders for files.
 * @param folders Array of folders to search recursively for files.
 * @param pattern The glob pattern to use when searching.
 * @returns A promise (or array of promises) for the array of entries found in each folder provided.
 */
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

/**
 * Takes two arrays and finds the elements in the first which weren't in the second.
 * Uses two functions to get keys from the array elements to use when checking for membership.
 * If no functions are provided it simply uses the element itself. (Good for arrays of primitives.)
 * @param arrA Array of type T to check for differences.
 * @param arrB Array of type U to check against.
 * @param getArrAKey Takes in something of type T and returns something that can be used as a key.
 * @param getArrBKey Takes in something of type U and returns something that can be used as a key.
 * @returns Array of type T containing elements which weren't found in arrB using either the key getters or the elements themselves
 *          to check for membership.
 */
export function arrayDifference<T, U>(arrA: T[], arrB: U[], getArrAKey?: (a: T) => unknown, getArrBKey?: (b: U) => unknown): T[]
{
  // add everything in arrB to a set so we can check for membership quickly
  const set = new Set();
  for (let i = 0; i < arrB.length; i += 1)
  {
    const item = arrB[i];
    const key  = getArrBKey ? getArrBKey(item) : item;
    set.add(key);
  }

  const result: T[] = [];
  for (let i = 0; i < arrA.length; i += 1)
  {
    const itemA = arrA[i];
    const keyA  = getArrAKey ? getArrAKey(itemA) : itemA;
    if (set.has(keyA)) continue;

    result[result.length] = itemA;
  }
  return result;
}


/**
 * Takes in a mime type string and attempts to extract the type and subtype.
 * @see https://stackoverflow.com/a/26721917
 * @param str A valid mime type string.
 * @returns An object with a type and subtype, both of type string|undefined.
 */
export function mimeRegex(str: string): { type: string | undefined, subtype: string | undefined }
{
  const re = /(\w+|\*)\/(\w+|\*)(\s*;\s*(\w+)=\s*=\s*(\S+))?/;
  const match = str.match(re);

  if (!match) return { type: undefined, subtype: undefined }

  return { type: match[1], subtype: match[2] };
}

export function compareStrings(a: string, b:string)
{
  // from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
  const nameA = a.toUpperCase(); // ignore upper and lowercase
  const nameB = b.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }

  // names must be equal
  return 0;
}
