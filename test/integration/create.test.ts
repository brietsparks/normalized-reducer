import { ForumState, forumEmptyState, forumActionCreators, forumReducer } from '../../src/test-cases';

describe('integration/create', () => {
  /*
  create an entity
  create an entity with data
  create an entity with omitted relational data
  create an entity at index

  if no such entity type, then no change
  if entity with the id already exists, then no change
  */

  test('create an entity', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: {},
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1'],
      },
    };

    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: {},
          o2: {},
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1', 'o2'],
      },
    };

    const action = forumActionCreators.create('post', 'o2');
    const nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  test('create an entity with data', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: {},
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1'],
      },
    };

    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: {},
          o2: { title: 'second post', body: 'lorem ipsum' },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1', 'o2'],
      },
    };

    const action = forumActionCreators.create('post', 'o2', { title: 'second post', body: 'lorem ipsum' });
    const nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  test('create an entity with omitted relational data', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        profile: { p1: {} },
        post: {},
        category: { c1: {} },
      },
      ids: {
        ...forumEmptyState.ids,
        profile: ['p1'],
        post: [],
        category: ['c1'],
      },
    };

    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        profile: { p1: {} },
        post: { o1: { title: 'second post', body: 'lorem ipsum' } },
        category: { c1: {} },
      },
      ids: {
        ...forumEmptyState.ids,
        profile: ['p1'],
        post: ['o1'],
        category: ['c1'],
      },
    };

    const action = forumActionCreators.create('post', 'o1', {
      title: 'second post',
      body: 'lorem ipsum',
      profileId: 'p1',
      categoryIds: ['c1'],
    });
    const nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  test('create an entity at index', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: {},
          o2: {},
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1', 'o2'],
      },
    };

    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: {},
          o2: {},
          o3: {},
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1', 'o3', 'o2'],
      },
    };

    const action = forumActionCreators.create('post', 'o3', undefined, 1);
    const nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  describe('no-op cases', () => {
    test('if no such entity type, then no change', () => {
      const action = forumActionCreators.create('chicken', 'c1');
      const nextState = forumReducer(forumEmptyState, action);
      expect(nextState).toEqual(forumEmptyState);
    });

    test('if entity with the id already exists, then no change', () => {
      const state: ForumState = {
        entities: {
          ...forumEmptyState.entities,
          post: {
            o1: {},
          },
        },
        ids: {
          ...forumEmptyState.ids,
          post: ['o1'],
        },
      };

      const action = forumActionCreators.create('post', 'o1');
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });
  });
});
