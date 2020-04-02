import { ForumState, forumEmptyState, forumActionCreators, forumReducer } from '../../src/test-cases';

test('integration/batch', () => {
  const state: ForumState = {
    entities: {
      ...forumEmptyState.entities,
      account: {
        a20: { profileId: 'p20' },
      },
      profile: {
        p10: {},
        p20: { accountId: 'a20', postIds: ['o20', 'o20.1', 'o20.1.1', 'o20.2'] },
      },
      post: {
        o20: { childIds: ['o20.1', 'o20.2'] },
        'o20.1': { parentId: 'o20', childIds: ['o20.1.1'] },
        'o20.2': { parentId: 'o20', categoryIds: ['c20'] },
        'o20.1.1': { parentId: 'o20.1', categoryIds: ['c20'] },
      },
      category: {
        c10: {},
        c20: { postIds: ['o20.2', 'o20.1.1'] },
      },
    },
    ids: {
      ...forumEmptyState.ids,
      account: ['a20'],
      profile: ['p10', 'p20'],
      post: ['o20', 'o20.1', 'o20.2', 'o20.1.1'],
      category: ['c10', 'c20'],
    },
  };

  const postCascadeSchema = () => ({ childIds: postCascadeSchema });

  const nextState = forumReducer(
    state,
    forumActionCreators.batch(
      forumActionCreators.create('post', 'o1'),
      forumActionCreators.create('category', 'c1', { name: 'new' }),
      forumActionCreators.attach('post', 'o1', 'profileId', 'p10'),
      forumActionCreators.attach('post', 'o1', 'categoryIds', 'c10'),
      forumActionCreators.attach('category', 'c1', 'postIds', 'o1'),
      forumActionCreators.delete('account', 'a20', { profileId: { postIds: postCascadeSchema } }),
      forumActionCreators.move('category', 0, 2),
      forumActionCreators.moveAttached('post', 'o1', 'categoryIds', 1, 0),
      forumActionCreators.detach('post', 'o1', 'profileId', 'p10'),
      forumActionCreators.update('profile', 'p10', { firstName: 'Dwight' })
    )
  );

  const expectedNextState: ForumState = {
    entities: {
      ...forumEmptyState.entities,
      profile: {
        p10: { postIds: [], firstName: 'Dwight' },
      },
      post: {
        o1: {
          profileId: undefined,
          categoryIds: ['c1', 'c10'],
        },
      },
      category: {
        c10: { postIds: ['o1'] },
        c20: { postIds: [] },
        c1: { postIds: ['o1'], name: 'new' },
      },
    },
    ids: {
      ...forumEmptyState.ids,
      profile: ['p10'],
      post: ['o1'],
      category: ['c20', 'c1', 'c10'],
    },
  };

  // console.log(JSON.stringify(nextState, null, 2))

  expect(nextState).toEqual(expectedNextState);
});
