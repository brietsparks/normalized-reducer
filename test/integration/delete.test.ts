import { ForumState, forumEmptyState, forumActionCreators, forumReducer } from '../../src/test-cases';

describe('integration/delete', () => {
  /*
  delete an entity
  delete an entity and detach entities from it
  delete an entity with a deletion schema, non-recursive
  delete an entity with a deletion schema, recursive

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

  test('delete an entity with a deletion schema', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        account: {
          a1: { profileId: 'p1' },
          a10: { profileId: 'p10' },
        },
        profile: {
          p1: { accountId: 'a1', postIds: ['o1', 'o2'] },
          p10: { accountId: 'a10' },
        },
        post: {
          o1: { profileId: 'p1', categoryIds: ['c1'] },
          o2: {
            profileId: 'p1',
            categoryIds: ['c1'],
            childIds: ['o2.1', 'o2.2'],
          },
          'o2.1': { parentId: 'o2' },
          'o2.2': {
            parentId: 'o2',
            childIds: ['o2.2.1'],
          },
          'o2.2.1': { parentId: 'o2.2' },
          o10: { profileId: 'o10' },
        },
        category: {
          c1: { postIds: ['o1', 'o2'] },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        account: ['a1', 'a10'],
        profile: ['p1', 'p10'],
        post: ['o1', 'o2', 'o10'],
        category: ['c1'],
      },
    };

    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        account: {
          a10: { profileId: 'p10' },
        },
        profile: {
          p10: { accountId: 'a10' },
        },
        post: {
          o10: { profileId: 'o10' },
        },
        category: {
          c1: { postIds: [] },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        account: ['a10'],
        profile: ['p10'],
        post: ['o10'],
        category: ['c1'],
      },
    };

    const postCascadeSchema = () => ({ childIds: postCascadeSchema });
    const accountCascadeSchema = {
      profileId: {
        postIds: postCascadeSchema,
      },
    };

    const action = forumActionCreators.delete('account', 'a1', accountCascadeSchema);

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
