import { forumReducer } from '../../src/test-cases';

describe('reducer', () => {
  it('returns the empty state given an undefined state', () => {
    // @ts-ignore
    forumReducer(undefined, { type: 'a' });
  });
});
