import { ForumState, forumEmptyState, forumReducer, forumActionCreators } from '../../src/test-cases';

describe('integration/detach', () => {
  /*
  detach a one-to-one attachment
  detach a one-to-many attachment
  detach a many-to-many attachment
  detach partially attached entities (invalid state)

  if no such entity type, then no change
  if entity not found, then no change
  if entity relation key not found, then no change
  if relation cardinality is one and the detachableId is not the attached id, then no change
  */
  test('detach a one-to-one attachment', () => {
    const state: ForumState = {
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

    const expectedNextState: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        account: { a1: { profileId: undefined } },
        profile: { p1: { accountId: undefined } },
      },
      ids: {
        ...forumEmptyState.ids,
        account: ['a1'],
        profile: ['p1'],
      },
    };

    let action, nextState;

    action = forumActionCreators.detach('account', 'a1', 'profileId', 'p1');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.detach('account', 'a1', 'profile', 'p1');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.detach('profile', 'p1', 'accountId', 'a1');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.detach('profile', 'p1', 'account', 'a1');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  test('detach a one-to-many attachment', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        profile: { p1: { postIds: ['o1', 'o2'] } },
        post: {
          o1: { profileId: 'p1' },
          o2: { profileId: 'p1' },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        profile: ['p1'],
        post: ['o1', 'o2'],
      },
    };

    const expectedNextState: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        profile: { p1: { postIds: ['o1'] } },
        post: {
          o1: { profileId: 'p1' },
          o2: { profileId: undefined },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        profile: ['p1'],
        post: ['o1', 'o2'],
      },
    };

    let action, nextState;

    action = forumActionCreators.detach('profile', 'p1', 'postIds', 'o2');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.detach('profile', 'p1', 'post', 'o2');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.detach('post', 'o2', 'profileId', 'p1');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.detach('post', 'o2', 'profile', 'p1');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  test('detach a many-to-many attachment', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: { categoryIds: ['c1', 'c2'] },
          o2: { categoryIds: ['c1', 'c2'] },
        },
        category: {
          c1: { postIds: ['o1', 'o2'] },
          c2: { postIds: ['o1', 'o2'] },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1', 'o2'],
        category: ['c1', 'c2'],
      },
    };

    const expectedNextState: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: { categoryIds: ['c1', 'c2'] },
          o2: { categoryIds: ['c1'] }, // <-- detached from c2
        },
        category: {
          c1: { postIds: ['o1', 'o2'] },
          c2: { postIds: ['o1'] }, // <-- detached from o2
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1', 'o2'],
        category: ['c1', 'c2'],
      },
    };

    let action, nextState;

    action = forumActionCreators.detach('post', 'o2', 'categoryIds', 'c2');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.detach('post', 'o2', 'category', 'c2');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.detach('category', 'c2', 'postIds', 'o2');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.detach('category', 'c2', 'post', 'o2');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  test('detach partially attached entities (invalid state)', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        profile: { p1: { postIds: ['o1'] } },
        post: { o1: {} },
      },
      ids: {
        ...forumEmptyState.ids,
        profile: ['p1'],
        post: ['o1'],
      },
    };

    const expectedNextState: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        profile: { p1: { postIds: [] } },
        post: { o1: {} },
      },
      ids: {
        ...forumEmptyState.ids,
        profile: ['p1'],
        post: ['o1'],
      },
    };

    let action, nextState;

    action = forumActionCreators.detach('profile', 'p1', 'postIds', 'o1');
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  describe('no-op cases', () => {
    const state: ForumState = {
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

    test('if no such entity type, then no change', () => {
      const action = forumActionCreators.detach('chicken', 'c1', 'profileId', 'p1');
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });

    test('if entity not found, then no change', () => {
      const action = forumActionCreators.detach('account', 'a900', 'profileId', 'p1');
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });

    test('if entity relation key not found, then no change', () => {
      const action = forumActionCreators.detach('account', 'a1', 'chickenId', 'c1');
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });

    test('if relation cardinality is one and the detachableId is not the attached id, then no change', () => {
      const action = forumActionCreators.detach('account', 'a1', 'profileId', 'p900');
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });
  });
});
