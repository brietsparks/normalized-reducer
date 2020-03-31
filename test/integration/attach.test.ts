import { ForumState, forumEmptyState, forumActionCreators, forumReducer } from '../../src/test-cases';

describe('integration/attach', () => {
  /*
  attach entities of a one-to-one relationship
  attach entities of a one-to-many relationship
  attach entities of a many-to-many relationship
  attach entities of a many-to-many relationship, with indices
  attach entities and displace existing attachments

  if no such entity type, then no change
  if entity not found, then no change
  if entity relation does not exist, then no change
  if attachable entity not found, then no change
  if entity is already attached in a has-many collection, then no change
  */

  test('attach entities of a one-to-one relationship', () => {
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

    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        account: { a1: { profileId: 'p1' } },
        profile: { p1: { accountId: 'a1' } },
      },
      ids: {
        ...forumEmptyState.ids,
        account: ['a1'],
        profile: ['p1'],
      },
    };

    let action, nextState;

    action = forumActionCreators.attach('account', 'a1', 'profileId', 'p1');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.attach('account', 'a1', 'profile', 'p1');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.attach('profile', 'p1', 'accountId', 'a1');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.attach('profile', 'p1', 'account', 'a1');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  test('attach entities of a one-to-many relationship', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        profile: { p1: {} },
        post: { o1: {} },
      },
      ids: {
        ...forumEmptyState.ids,
        profile: ['p1'],
        post: ['o1'],
      },
    };

    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        profile: { p1: { postIds: ['o1'] } },
        post: { o1: { profileId: 'p1' } },
      },
      ids: {
        ...forumEmptyState.ids,
        profile: ['p1'],
        post: ['o1'],
      },
    };

    let action, nextState;

    action = forumActionCreators.attach('profile', 'p1', 'postIds', 'o1');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.attach('profile', 'p1', 'post', 'o1');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.attach('post', 'o1', 'profileId', 'p1');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.attach('post', 'o1', 'profile', 'p1');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  test('attach entities of a many-to-many relationship', () => {
    // this could be improved by validating that the attachedId is appended (not prepended, etc)
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        post: { o1: {} },
        category: { c1: {} },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1'],
        category: ['c1'],
      },
    };

    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        post: { o1: { categoryIds: ['c1'] } },
        category: { c1: { postIds: ['o1'] } },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1'],
        category: ['c1'],
      },
    };

    let action, nextState;

    action = forumActionCreators.attach('post', 'o1', 'categoryIds', 'c1');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.attach('post', 'o1', 'category', 'c1');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.attach('category', 'c1', 'postIds', 'o1');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.attach('category', 'c1', 'post', 'o1');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  test('attach entities of a many-to-many relationship, with indices', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: { categoryIds: ['c1', 'c2'] },
          o2: { categoryIds: ['c1'] },
        },
        category: {
          c1: { postIds: ['o1', 'o2'] },
          c2: { postIds: ['o1'] },
          c3: { postIds: [] },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1', 'o2'],
        category: ['c1', 'c2', 'c3'],
      },
    };

    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: { categoryIds: ['c1', 'c3', 'c2'] },
          o2: { categoryIds: ['c1'] },
        },
        category: {
          c1: { postIds: ['o1', 'o2'] },
          c2: { postIds: ['o1'] },
          c3: { postIds: ['o1'] },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1', 'o2'],
        category: ['c1', 'c2', 'c3'],
      },
    };

    let action, nextState;

    action = forumActionCreators.attach('post', 'o1', 'categoryIds', 'c3', { index: 1 });
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.attach('post', 'o1', 'category', 'c3', { index: 1 });
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.attach('category', 'c3', 'postIds', 'o1', { reciprocalIndex: 1 });
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.attach('category', 'c3', 'post', 'o1', { reciprocalIndex: 1 });
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  test('attach entities and displace existing attachments', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        account: {
          a1: { profileId: 'p1' },
          a2: {},
        },
        profile: {
          p1: { accountId: 'a1' },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        account: ['a1', 'a2'],
        profile: ['p1'],
      },
    };

    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        account: {
          a1: { profileId: undefined },
          a2: { profileId: 'p1' },
        },
        profile: {
          p1: { accountId: 'a2' },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        account: ['a1', 'a2'],
        profile: ['p1'],
      },
    };

    let action, nextState;

    action = forumActionCreators.attach('account', 'a2', 'profileId', 'p1');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.attach('account', 'a2', 'profile', 'p1');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.attach('profile', 'p1', 'accountId', 'a2');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.attach('profile', 'p1', 'account', 'a2');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  describe('no-op cases', () => {
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

    test('if no such entity type, then no change', () => {
      const action = forumActionCreators.attach('chicken', 'c1', 'profileId', 'p1');
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });

    test('if entity not found, then no change', () => {
      const action = forumActionCreators.attach('account', 'a900', 'profileId', 'p1');
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });

    test('if entity relation does not exist, then no change', () => {
      const action = forumActionCreators.attach('account', 'a1', 'chickenId', 'c1');
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });

    test('if attachable entity not found, then no change', () => {
      const action = forumActionCreators.attach('account', 'a1', 'profileId', 'p900');
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });

    test('if entity is already attached in a has-many collection, then no change', () => {
      const state: ForumState = {
        entities: {
          ...forumEmptyState.entities,
          post: {
            o1: { categoryIds: ['c1', 'c3', 'c2'] },
            o2: { categoryIds: ['c1'] },
          },
          category: {
            c1: { postIds: ['o1', 'o2'] },
            c2: { postIds: ['o1'] },
            c3: { postIds: ['o1'] },
          },
        },
        ids: {
          ...forumEmptyState.ids,
          post: ['o1', 'o2'],
          category: ['c1', 'c2', 'c3'],
        },
      };

      let action, nextState;

      action = forumActionCreators.attach('post', 'o1', 'categoryIds', 'c3');
      nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });
  });
});
