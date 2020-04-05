import { arrayPut, arrayMove, isObjectLiteral, defaultNamespaced, noop } from '../../src/util';

describe('unit/util', () => {
  describe('arrayPut', () => {
    test('if no array is provided, it returns an array with the single item', () => {
      const result = arrayPut('a');
      expect(result).toEqual(['a']);
    });

    test('if index is not provided, it appends the item immutably', () => {
      const result = arrayPut<string>('c', ['a', 'b']);
      const expected = ['a', 'b', 'c'];
      expect(result).toEqual(expected);
      expect(result).not.toBe(expected);
    });

    test('if index is provided, it inserts the at the index immutably', () => {
      const result = arrayPut<string>('c', ['a', 'b'], 1);
      const expected = ['a', 'c', 'b'];
      expect(result).toEqual(expected);
      expect(result).not.toBe(expected);
    });
  });

  describe('arrayMove', () => {
    test('if either index is < 0, it returns the array with no changes,', () => {
      const arr = ['a', 'b', 'c'];

      let result;

      result = arrayMove(arr, -1, 1);
      expect(result).toEqual(arr);
      expect(result).toBe(arr);

      result = arrayMove(arr, 1, -1);
      expect(result).toEqual(arr);
      expect(result).toBe(arr);
    });

    test('if the fromIndex is higher than the highest index, then it moves the last item immutably', () => {
      const arr = ['a', 'b', 'c'];

      const result = arrayMove(arr, 3, 1);
      const expected = ['a', 'c', 'b'];
      expect(result).toEqual(expected);
      expect(result).not.toBe(expected);
    });

    it('moves an item immutably between two valid indices', () => {
      const arr = ['a', 'b', 'c', 'd', 'd'];

      const result = arrayMove(arr, 1, 3);
      const expected = ['a', 'c', 'd', 'b', 'd'];
      expect(result).toEqual(expected);
      expect(result).not.toBe(expected);
    });
  });

  test('isObjectLiteral', () => {
    expect(isObjectLiteral({})).toEqual(true);

    expect(isObjectLiteral('a')).toEqual(false);
    expect(isObjectLiteral(true)).toEqual(false);
    expect(isObjectLiteral(2)).toEqual(false);
    expect(isObjectLiteral(null)).toEqual(false);
    expect(isObjectLiteral(undefined)).toEqual(false);
    expect(isObjectLiteral([])).toEqual(false);
    expect(isObjectLiteral(() => {})).toEqual(false);
  });

  test('defaultNamespaced', () => {
    expect(defaultNamespaced('CREATE')).toEqual('normalized/CREATE');
  });

  test('noop', () => {
    expect(noop()).toEqual(undefined);
  });
});
