import { blogSelectors, blogExampleState } from './test-cases/blog';
import {
  forumSelectors,
  forumEmptyState,
  ForumState,
} from './test-cases/forum';

describe('selectors', () => {
  describe('getAttachedArr', () => {
    test('cardinality of one', () => {
      const expected = ['r1', 'r2'];

      const result = blogSelectors.getAttachedArr(blogExampleState, {
        entity: 'author',
        id: 'a1',
        rel: 'articleIds',
      });

      expect(result).toEqual(expected);
    });

    test('cardinality of many', () => {
      const result = blogSelectors.getAttachedArr(blogExampleState, {
        entity: 'article',
        id: 'r1',
        rel: 'authorId',
      });

      const expected = ['a1'];

      expect(result).toEqual(expected);
    });
  });

  test('getEntityAttachedArr', () => {
    // note: this is not actually valid state
    const state = {
      resources: {
        ...forumEmptyState.resources,
        profile: {
          p1: {
            accountId: 'a1',
            postIds: ['o1', 'o2'],
          },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        profile: ['p1'],
      },
    };

    const result = forumSelectors.getAllAttachedArr(state, {
      entity: 'profile',
      id: 'p1',
    });

    const expected = {
      accountId: ['a1'],
      postIds: ['o1', 'o2'],
    };

    expect(result).toEqual(expected);
  });

  describe('getTree', () => {
    test('basic', () => {
      const state: ForumState = {
        resources: {
          account: {
            a1: { profileId: 'p1' },
            a2: { profileId: 'p2' },
          },
          profile: {
            p1: { accountId: 'p1', postIds: ['o1', 'o2'] },
            p2: { accountId: 'p2', postIds: ['o3'] },
          },
          post: {
            o1: { profileId: 'p1', categoryIds: ['c1'], tagIds: ['t1'] },
            o2: { profileId: 'p1', categoryIds: ['c1', 'c2'] },
            o3: { profileId: 'p2', categoryIds: ['c2', 'c3'] },
          },
          tag: {
            t1: { postIds: ['o1'] },
          },
          category: {
            c1: { postIds: ['o1', 'o2'] },
            c2: { postIds: ['o2', 'o3'] },
            c3: { postIds: ['o3'] },
          },
        },
        ids: {
          account: ['a1', 'a2'],
          profile: ['p1', 'p2'],
          post: ['o1', 'o2', 'o3'],
          tag: ['t1'],
          category: ['c1', 'c2', 'c3'],
        },
      };

      const schema = {
        profileId: {
          postIds: {
            tagIds: {},
            categoryIds: {},
          },
        },
      };

      const result = forumSelectors.getResourceTree(state, {
        entity: 'account',
        id: 'a1',
        schema,
      });

      const expected = [
        { entity: 'account', id: 'a1', resource: { profileId: 'p1' } },
        {
          entity: 'profile',
          id: 'p1',
          resource: { accountId: 'p1', postIds: ['o1', 'o2'] },
        },
        {
          entity: 'post',
          id: 'o1',
          resource: { profileId: 'p1', categoryIds: ['c1'], tagIds: ['t1'] },
        },
        { entity: 'tag', id: 't1', resource: { postIds: ['o1'] } },
        { entity: 'category', id: 'c1', resource: { postIds: ['o1', 'o2'] } },
        {
          entity: 'post',
          id: 'o2',
          resource: { profileId: 'p1', categoryIds: ['c1', 'c2'] },
        },
        { entity: 'category', id: 'c2', resource: { postIds: ['o2', 'o3'] } },
      ];

      expect(result).toEqual(expected);
    });

    test('self-referencing', () => {
      const state: ForumState = {
        resources: {
          ...forumEmptyState.resources,
          post: {
            o1: { childIds: ['o1.1', 'o1.2'] },
            'o1.1': { parentId: 'o1', childIds: ['o1.1.1', 'o1.1.2'] },
            'o1.1.1': { parentId: 'o1.1' },
            'o1.1.2': { parentId: 'o1.1' },
            'o1.2': { parentId: 'o1' },
            o2: {},
          },
        },
        ids: {
          ...forumEmptyState.ids,
          post: ['o1', 'o1.1', 'o1.1.1', 'o1.1.2', 'o1.2', 'o2'],
        },
      };

      const schema = () => ({ childIds: schema });

      const result = forumSelectors.getResourceTree(state, {
        entity: 'post',
        id: 'o1',
        schema,
      });

      const expected = [
        { entity: 'post', id: 'o1', resource: { childIds: ['o1.1', 'o1.2'] } },
        {
          entity: 'post',
          id: 'o1.1',
          resource: { parentId: 'o1', childIds: ['o1.1.1', 'o1.1.2'] },
        },
        { entity: 'post', id: 'o1.1.1', resource: { parentId: 'o1.1' } },
        { entity: 'post', id: 'o1.1.2', resource: { parentId: 'o1.1' } },
        { entity: 'post', id: 'o1.2', resource: { parentId: 'o1' } },
      ];

      expect(result).toEqual(expected);
    });
  });
});
