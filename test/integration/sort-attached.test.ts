import {
  ForumState,
  forumEmptyState,
  forumActionCreators,
  forumReducer,
  Category,
} from '../../src/test-cases';

describe('integration/sort-attached', () => {
  /*
  sort attached entities

  if no such entity type, then no change
  if entity not found, then no change
  if entity relation key not found, then no change
  if entity relation cardinality is one, then no change
  if entity attachedIds is not an array, then no change
  */

  const compare = (a: Category, b: Category) => (a.name > b.name ? 1 : -1);

  test('sort attached entities', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: { categoryIds: ['c1', 'c2', 'c3', 'c4', 'c5'] },
        },
        category: {
          c1: { postIds: ['o1'], name: 'b' },
          c2: { postIds: ['o1'], name: 'd' },
          c3: { postIds: ['o1'], name: 'e' },
          c4: { postIds: ['o1'], name: 'a' },
          c5: { postIds: ['o1'], name: 'c' },
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
          o1: { categoryIds: ['c4', 'c1', 'c5', 'c2', 'c3'] }, // sorted
        },
        category: {
          c1: { postIds: ['o1'], name: 'b' },
          c2: { postIds: ['o1'], name: 'd' },
          c3: { postIds: ['o1'], name: 'e' },
          c4: { postIds: ['o1'], name: 'a' },
          c5: { postIds: ['o1'], name: 'c' },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1'],
        category: ['c1', 'c2', 'c3', 'c4', 'c5'],
      },
    };

    let action, nextState;

    action = forumActionCreators.sortAttached<Category>('post', 'o1', 'categoryIds', compare);
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);

    action = forumActionCreators.sortAttached<Category>('post', 'o1', 'category', compare);
    nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  describe('no-op cases', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          o1: { categoryIds: ['c1', 'c2', 'c3'] },
        },
        category: {
          c1: { postIds: ['o1'], name: 'b' },
          c2: { postIds: ['o1'], name: 'c' },
          c3: { postIds: ['o1'], name: 'a' },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['o1'],
        category: ['c1', 'c2', 'c3'],
      },
    };

    test('if no such entity type, then no change', () => {
      const action = forumActionCreators.sortAttached('chicken', 'c1', 'categoryIds', compare);
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });

    test('if no such entity type, then no change', () => {
      const action = forumActionCreators.sortAttached('post', 'p900', 'categoryIds', compare);
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });

    test('if entity relation key not found, then no change', () => {
      const action = forumActionCreators.sortAttached('post', 'o1', 'chickenIds', compare);
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });

    test('if entity relation cardinality is one, then no change', () => {
      const action = forumActionCreators.sortAttached('post', 'o1', 'profileId', compare);
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });

    test('if entity attachedIds is not an array, then no change', () => {
      const action = forumActionCreators.sortAttached('post', 'o1', 'tagIds', compare);
      const nextState = forumReducer(state, action);
      expect(nextState).toEqual(state);
    });
  });
});
