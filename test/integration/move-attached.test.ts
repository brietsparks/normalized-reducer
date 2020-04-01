import { ForumState, forumEmptyState, forumActionCreators, forumReducer } from '../../src/test-cases';

describe('integration/move-attached', () => {
  /*
    move attached entity given between two non-zero indices
    move attached entity to index 0
    attempt to move attached entity from an index beyond highest existing index
    attempt to move attached entity to an index beyond highest existing index

    if no such entity type, then no change
    if entity not found, then no change
    if entity relation key not found, then no change
    if entity relation cardinality is one, then no change
    if entity attachedIds is not an array, then no change
    if source index < 0, then no change
    if destination index < 0, then no change
  */

  test('move attached entity given between two non-zero indices', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: { categoryIds: ['c1', 'c2', 'c3', 'c4', 'c5'] },
        },
        category: {
          c1: { postIds: ['o1'] },
          c2: { postIds: ['o1'] },
          c3: { postIds: ['o1'] },
          c4: { postIds: ['o1'] },
          c5: { postIds: ['o1'] },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1'],
        category: ['c1', 'c2', 'c3', 'c4', 'c5'],
      },
    };

    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: { categoryIds: ['c1', 'c3', 'c4', 'c2', 'c5'] },
        }, // moved c2 from index 1 to 3
        category: {
          c1: { postIds: ['o1'] },
          c2: { postIds: ['o1'] },
          c3: { postIds: ['o1'] },
          c4: { postIds: ['o1'] },
          c5: { postIds: ['o1'] },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1'],
        category: ['c1', 'c2', 'c3', 'c4', 'c5'],
      },
    };

    let action, nextState;

    action = forumActionCreators.moveAttached('post', 'o1', 'categoryIds', 1, 3);
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.moveAttached('post', 'o1', 'category', 1, 3);
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  test('move attached entity to index 0', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: { categoryIds: ['c1', 'c2', 'c3'] },
        },
        category: {
          c1: { postIds: ['o1'] },
          c2: { postIds: ['o1'] },
          c3: { postIds: ['o1'] },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1'],
        category: ['c1', 'c2', 'c3'],
      },
    };

    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: { categoryIds: ['c3', 'c1', 'c2'] },
        },
        category: {
          c1: { postIds: ['o1'] },
          c2: { postIds: ['o1'] },
          c3: { postIds: ['o1'] },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1'],
        category: ['c1', 'c2', 'c3'],
      },
    };

    let action, nextState;

    action = forumActionCreators.moveAttached('post', 'o1', 'categoryIds', 2, 0);
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.moveAttached('post', 'o1', 'category', 2, 0);
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  test('attempt to move attached entity from an index beyond highest existing index', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: { categoryIds: ['c1', 'c2', 'c3'] },
        },
        category: {
          c1: { postIds: ['o1'] },
          c2: { postIds: ['o1'] },
          c3: { postIds: ['o1'] },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1'],
        category: ['c1', 'c2', 'c3'],
      },
    };

    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: { categoryIds: ['c1', 'c3', 'c2'] },
        },
        category: {
          c1: { postIds: ['o1'] },
          c2: { postIds: ['o1'] },
          c3: { postIds: ['o1'] },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1'],
        category: ['c1', 'c2', 'c3'],
      },
    };

    let action, nextState;

    action = forumActionCreators.moveAttached('post', 'o1', 'categoryIds', 3, 1);
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.moveAttached('post', 'o1', 'category', 3, 1);
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  test('attempt to move attached entity to an index beyond highest existing index', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: { categoryIds: ['c1', 'c2', 'c3'] },
        },
        category: {
          c1: { postIds: ['o1'] },
          c2: { postIds: ['o1'] },
          c3: { postIds: ['o1'] },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1'],
        category: ['c1', 'c2', 'c3'],
      },
    };

    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: { categoryIds: ['c1', 'c3', 'c2'] },
        },
        category: {
          c1: { postIds: ['o1'] },
          c2: { postIds: ['o1'] },
          c3: { postIds: ['o1'] },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1'],
        category: ['c1', 'c2', 'c3'],
      },
    };

    let action, nextState;

    action = forumActionCreators.moveAttached('post', 'o1', 'categoryIds', 1, 3);
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.moveAttached('post', 'o1', 'category', 1, 3);
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  describe('no-op cases', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        profile: {
          p1: { postIds: ['o1'] },
        },
        post: {
          o1: {
            profileId: 'p1',
            categoryIds: ['c1', 'c2', 'c3'],
          },
        },
        category: {
          c1: { postIds: ['o1'] },
          c2: { postIds: ['o1'] },
          c3: { postIds: ['o1'] },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1'],
        category: ['c1', 'c2', 'c3'],
      },
    };

    test('if no such entity type, then no change', () => {
      const action = forumActionCreators.moveAttached('chicken', 'c1', 'categoryIds', 0, 2);
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });

    test('if no such entity type, then no change', () => {
      const action = forumActionCreators.moveAttached('post', 'p900', 'categoryIds', 0, 2);
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });

    test('if entity relation key not found, then no change', () => {
      const action = forumActionCreators.moveAttached('post', 'o1', 'chickenIds', 0, 2);
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });

    test('if entity relation cardinality is one, then no change', () => {
      const action = forumActionCreators.moveAttached('post', 'o1', 'profileId', 0, 2);
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });

    test('if entity attachedIds is not an array, then no change', () => {
      const action = forumActionCreators.moveAttached('post', 'o1', 'tagIds', 0, 2);
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });

    test('if source index < 0, then no change', () => {
      const action = forumActionCreators.moveAttached('post', 'o1', 'categoryIds', -1, 2);
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });

    test('if source destination < 0, then no change', () => {
      const action = forumActionCreators.moveAttached('post', 'o1', 'categoryIds', 2, -1);
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });
  });
});
