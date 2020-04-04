import { forumActionCreators, forumEmptyState, forumReducer, ForumState } from '../../src/test-cases';
import { UpdateActionMethod } from '../../src';

describe('integration/update', () => {
  /*
  update an entity via patch
  update an entity via put
  update an entity with omitted relational data
  updating an entity via put does not replace relational data

  if no such entity type, then no change
  if entity not found, then no change
  */

  test('update an entity via patch', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: { title: 'first post', body: 'lorem ipsum' },
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
          o1: { title: 'first post', body: 'the sky is falling' },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1'],
      },
    };

    const action = forumActionCreators.update('post', 'o1', { body: 'the sky is falling' });
    const nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  test('update an entity via put', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: { title: 'first post', body: 'lorem ipsum' },
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
          o1: { body: 'the sky is falling' },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1'],
      },
    };

    const action = forumActionCreators.update(
      'post',
      'o1',
      { body: 'the sky is falling' },
      { method: UpdateActionMethod.PUT }
    );
    const nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  test('update an entity with omitted relational data', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        profile: { p1: {} },
        post: {
          o1: { title: 'first post', body: 'lorem ipsum' },
        },
        category: { c1: {} },
      },
      ids: {
        ...forumEmptyState.ids,
        profile: ['p1'],
        post: ['o1'],
        category: ['c1'],
      },
    };

    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        profile: { p1: {} },
        post: {
          o1: { title: 'first post', body: 'the sky is falling' },
        },
        category: { c1: {} },
      },
      ids: {
        ...forumEmptyState.ids,
        profile: ['p1'],
        post: ['o1'],
        category: ['c1'],
      },
    };

    const action = forumActionCreators.update('post', 'o1', {
      body: 'the sky is falling',
      profileId: 'p1',
      categoryIds: ['c1'],
    });
    const nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  test('updating an entity via put does not replace relational data', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        profile: {
          p1: { postIds: ['o1'] },
        },
        post: {
          o1: {
            profileId: 'o1',
            categoryIds: ['c1'],
            title: 'first post',
            body: 'lorem ipsum',
          },
        },
        category: {
          c1: { postIds: ['o1'] },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        profile: ['p1'],
        post: ['o1'],
        category: ['c1'],
      },
    };

    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        profile: {
          p1: { postIds: ['o1'] },
        },
        post: {
          o1: {
            profileId: 'o1',
            categoryIds: ['c1'],
            body: 'the sky is falling',
          },
        },
        category: {
          c1: { postIds: ['o1'] },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        profile: ['p1'],
        post: ['o1'],
        category: ['c1'],
      },
    };

    const action = forumActionCreators.update(
      'post',
      'o1',
      { body: 'the sky is falling' },
      { method: UpdateActionMethod.PUT }
    );

    const nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  describe('no-op cases', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: { title: 'first post', body: 'lorem ipsum' },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1'],
      },
    };

    test('if no such entity type, then no change', () => {
      const action = forumActionCreators.update('chicken', 'o900', { body: 'the sky is falling' });
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });

    test('if entity not found, then no change', () => {
      const action = forumActionCreators.update('post', 'o900', { body: 'the sky is falling' });
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });
  });
});
