import { ForumState, forumEmptyState, forumActionCreators, forumReducer } from '../../src/test-cases';

describe('integration/state-setters', () => {
  describe('setState', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        account: { a1: {} },
        profile: { p1: {} },
      },
      ids: {
        ...forumEmptyState.ids,
        account: ['a1'],
        profile: ['p1'],
      },
    };

    test('set empty state to populated state', () => {
      const action = forumActionCreators.setState(state);
      const nextState = forumReducer(forumEmptyState, action);
      expect(nextState).toEqual(state);
    });

    test('set populated state to empty state', () => {
      const action = forumActionCreators.setState(forumEmptyState);
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(forumEmptyState);
    });
  });
});
