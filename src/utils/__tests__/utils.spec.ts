import { join } from 'path';
import normalize from 'normalize-path';
import { arrayDifference, isNumberArray, filenameExtension, glob, mimeRegex } from "../utils";

describe('isNumberArray()', () => {
  test('should return correct result', () => {
    expect(isNumberArray([])).toBeTruthy();
    expect(isNumberArray([1])).toBeTruthy();
    expect(isNumberArray([1, 2, 3])).toBeTruthy();
    expect(isNumberArray([1, 0.1])).toBeTruthy();

    expect(isNumberArray(['1'])).toBeFalsy();
    expect(isNumberArray([1, '1'])).toBeFalsy();
    expect(isNumberArray([{ a: 1 }, { b: 2 }])).toBeFalsy();
  });
});

describe('glob()', () => {
  test('should return expected file paths from folder', async () => {
    const results  = await glob(join(__dirname, './glob_test_dir/first'));
    const paths    = results.map(entry => entry.path).map(path => normalize(path, true));
    const expected = [
      join(__dirname, './glob_test_dir/first/b/testB.txt'),
      join(__dirname, './glob_test_dir/first/a/testA'),
      join(__dirname, './glob_test_dir/first/b/c/testC.txt'),
    ].map(path => normalize(path, true));

    expect(paths.sort()).toEqual(expected.sort());
  });

  test('should return expected file paths from folder array', async () => {
    const results  = (await Promise.all(glob([join(__dirname, './glob_test_dir/first'), join(__dirname, './glob_test_dir/second')]))).flat();
    const paths    = results.map(entry => normalize(entry.path, true));
    const expected = [
      join(__dirname, './glob_test_dir/first/b/testB.txt'),
      join(__dirname, './glob_test_dir/first/a/testA'),
      join(__dirname, './glob_test_dir/first/b/c/testC.txt'),
      join(__dirname, './glob_test_dir/second/testSecond.txt'),
    ].map(path => normalize(path, true));

    expect(paths.sort()).toEqual(expected.sort());
  });
});

describe('filenameExtension()', () => {
  test('should get correct extension from filename', () => {
    const inputs  = [ "", "name", "name.txt", ".htpasswd", "name.with.many.dots.myext", "ends."];
    const outputs = [ "", "", "txt", "", "myext", ""];

    inputs.forEach((input, i) => {
      expect(filenameExtension(input)).toEqual(outputs[i]);
    });
  });
});

describe('arrayDifference()', () => {
  type TypeA = { nameA: string };
  type TypeB = { nameB: string };
  const getterA = (a: TypeA) => a.nameA;
  const getterB = (a: TypeB) => a.nameB;

  test('should return [] when the input arrays\' elements match', () => {
    expect(arrayDifference([], [])).toEqual([]);
    expect(arrayDifference([1], [1])).toEqual([]);
    expect(arrayDifference([1, 2, 3], [1, 2, 3])).toEqual([]);
    expect(arrayDifference(['1', '2', '3'], ['1', '2', '3'])).toEqual([]);

    const inputA: TypeA[] = [{ nameA: '1' },{ nameA: '2' },{ nameA: '3' }];
    const inputB: TypeB[] = [{ nameB: '1' },{ nameB: '2' },{ nameB: '3' }];

    expect(arrayDifference(inputA, inputB, getterA, getterB)).toEqual([]);
  });

  test('should return the elements in arrA that don\'t match any from arrB', () => {
    expect(arrayDifference([], [2, 3])).toEqual([]);
    expect(arrayDifference([1], [])).toEqual([1]);
    expect(arrayDifference([1], [2])).toEqual([1]);
    expect(arrayDifference([1, 2, 3], [3, 4, 5])).toEqual([1, 2]);
    expect(arrayDifference(['1', '2', '3'], ['3', '4', '5'])).toEqual(['1', '2']);

    const inputA: TypeA[] = [{ nameA: '1' },{ nameA: '2' },{ nameA: '3' }];
    const inputB: TypeB[] = [{ nameB: '3' },{ nameB: '4' },{ nameB: '5' }];
    const output: TypeA[] = [{ nameA: '1' },{ nameA: '2' }];

    expect(arrayDifference(inputA, inputB, getterA, getterB)).toEqual(output);
  });
});

describe('mimeRegex()', () => {
  test('should extract type and subtype from valid mime type string', () => {
    const inputs = [
      'image/jpeg',
      'application/atom+xml',
      'application/EDI-X12',
      'application/xml-dtd',
      'application/zip',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'video/quicktime',
      'application/json; indent=4',
      'application/json',
      'text/*',
      '*/*',
    ];
    const outputs = [
      { type: 'image',       subtype: 'jpeg' },
      { type: 'application', subtype: 'atom' },
      { type: 'application', subtype: 'EDI' },
      { type: 'application', subtype: 'xml' },
      { type: 'application', subtype: 'zip' },
      { type: 'application', subtype: 'vnd' },
      { type: 'video',       subtype: 'quicktime' },
      { type: 'application', subtype: 'json' },
      { type: 'application', subtype: 'json' },
      { type: 'text',        subtype: '*' },
      { type: '*' ,          subtype: '*' },
    ];

    inputs.forEach((input, i) => expect(mimeRegex(input)).toEqual(outputs[i]))

  });
});
