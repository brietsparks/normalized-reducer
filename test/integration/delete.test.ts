import { ForumState, forumEmptyState, forumActionCreators, forumReducer } from '../../src/test-cases';

describe('integration/delete', () => {
  /*
  delete an entity
  delete an entity and detach entities from it

  if no such entity type, then no change
  if entity not found, then no change
  */

  test('delete an entity', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        profile: { p1: {} },
      },
      ids: {
        ...forumEmptyState.ids,
        profile: ['p1'],
      },
    };

    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        profile: {},
      },
      ids: {
        ...forumEmptyState.ids,
        profile: [],
      },
    };

    const action = forumActionCreators.delete('profile', 'p1');
    const nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  test('delete an entity and detach entities from it', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        profile: {
          p1: { postIds: ['o1', 'o2', 'o3'] },
        },
        post: {
          o1: { profileId: 'p1', categoryIds: ['c1'] },
          o2: { profileId: 'p1', categoryIds: ['c1'] },
          o3: { profileId: 'p1', categoryIds: ['c1'] },
        },
        category: {
          c1: { postIds: ['o1', 'o2', 'o3'] },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        profile: ['p1'],
        post: ['o1', 'o2', 'o3'],
        category: ['c1'],
      },
    };

    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        profile: {
          p1: { postIds: ['o1', 'o3'] },
        },
        post: {
          o1: { profileId: 'p1', categoryIds: ['c1'] },
          o3: { profileId: 'p1', categoryIds: ['c1'] },
        },
        category: {
          c1: { postIds: ['o1', 'o3'] },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        profile: ['p1'],
        post: ['o1', 'o3'],
        category: ['c1'],
      },
    };

    const action = forumActionCreators.delete('post', 'o2');
    const nextState = forumReducer(state, action);

    expect(nextState).toEqual(expectedNextState);
  });

  describe('no-op cases', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        account: {},
      },
      ids: {
        ...forumEmptyState.ids,
        account: [],
      },
    };

    test('if no such entity type, then no change', () => {
      const action = forumActionCreators.delete('chicken', 'c1');
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });

    test('if entity not found, then no change', () => {
      const action = forumActionCreators.delete('account', 'a900');
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });
  });
});
