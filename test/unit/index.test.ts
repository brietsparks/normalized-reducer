import makeNormalizedSlice from '../../src';

describe('unit/index', () => {
  test('action types namespacing', () => {
    let slice;

    slice = makeNormalizedSlice({});
    Object.values(slice.actionTypes).forEach(actionType => {
      const prefix = actionType.split('/')[0];
      expect(prefix).toEqual('normalized');
    });

    slice = makeNormalizedSlice({}, actionType => `custom/${actionType}`);
    Object.values(slice.actionTypes).forEach(actionType => {
      const prefix = actionType.split('/')[0];
      expect(prefix).toEqual('custom');
    });
  });
});
