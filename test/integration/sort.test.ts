import { ForumState, forumEmptyState, forumActionCreators, forumReducer, Post } from '../../src/test-cases';

describe('integration/sort', () => {
  /*
  sort entities
  if no such entity type, then no change
  */
  const state: ForumState = {
    entities: {
      ...forumEmptyState.entities,
      post: {
        p1: { title: 'z' },
        p2: { title: 'b' },
        p3: { title: 'a' },
        p4: { title: 'b' },
      },
    },
    ids: {
      ...forumEmptyState.ids,
      post: ['p1', 'p2', 'p3', 'p4'],
    },
  };

  const compare = (a: Post, b: Post) => (a.title > b.title ? 1 : -1);

  test('sort entities', () => {
    const expectedNextState = {
      entities: {
        ...forumEmptyState.entities,
        post: {
          p1: { title: 'z' },
          p2: { title: 'b' },
          p3: { title: 'a' },
          p4: { title: 'b' },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        post: ['p3', 'p2', 'p4', 'p1'],
      },
    };

    const action = forumActionCreators.sort<Post>('post', compare);
    const nextState = forumReducer(state, action);
    expect(nextState).toEqual(expectedNextState);
  });

  test.todo('sort entities with a comparison that results in an error');

  test('if no such entity type, then no change', () => {
    const action = forumActionCreators.sort('chicken', compare);
    const nextState = forumReducer(state, action);
    expect(nextState).toEqual(state);
  });
});
