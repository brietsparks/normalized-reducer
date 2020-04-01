import { ForumState, forumEmptyState, forumActionCreators, forumReducer } from '../../src/test-cases';

describe('integration/move', () => {
  /*
  move entity given between two non-zero indices
  move entity to index 0

  attempt to move entity from an index beyond highest existing index
  attempt to move entity to an index beyond highest existing index

  if no such entity type, then no change
  if source index < 0, then no change
  if destination index < 0, then no change
  */

  test('move entity given existing indices', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        post: { p1: {}, p2: {}, p3: {}, p4: {}, p5: {} },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['p1', 'p2', 'p3', 'p4', 'p5'],
      },
    };

    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        post: { p1: {}, p2: {}, p3: {}, p4: {}, p5: {} },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['p1', 'p3', 'p4', 'p2', 'p5'],
      },
    };

    const action = forumActionCreators.move('post', 1, 3);
    const nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  test('move entity to index 0', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        post: { p1: {}, p2: {}, p3: {} },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['p1', 'p2', 'p3'],
      },
    };

    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        post: { p1: {}, p2: {}, p3: {} },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['p3', 'p1', 'p2'],
      },
    };

    const action = forumActionCreators.move('post', 2, 0);
    const nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  test('attempt to move entity from an index beyond highest existing index', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        post: { p1: {}, p2: {}, p3: {} },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['p1', 'p2', 'p3'],
      },
    };

    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        post: { p1: {}, p2: {}, p3: {} },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['p1', 'p3', 'p2'],
      },
    };

    const action = forumActionCreators.move('post', 3, 1);
    const nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  test('attempt to move entity to an index beyond highest existing index', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        post: { p1: {}, p2: {}, p3: {} },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['p1', 'p2', 'p3'],
      },
    };

    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        post: { p1: {}, p2: {}, p3: {} },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['p2', 'p3', 'p1'],
      },
    };

    const action = forumActionCreators.move('post', 0, 6);
    const nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  describe('no-op cases', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        post: { p1: {}, p2: {}, p3: {} },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['p1', 'p2', 'p3'],
      },
    };

    test('if no such entity type, then no change', () => {
      const action = forumActionCreators.move('chicken', 0, 2);
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });

    test('if source index < 0, then no change', () => {
      const action = forumActionCreators.move('post', -1, 2);
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });

    test('if destination index < 0, then no change', () => {
      const action = forumActionCreators.move('post', 2, -1);
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });
  });
});
