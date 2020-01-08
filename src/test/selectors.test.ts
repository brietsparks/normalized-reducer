import { blogSelectors, blogState } from './test-cases/blog';
import { forumSelectors, forumEmptyState } from './test-cases/forum';

describe('selectors', () => {
  describe('getArr', () => {
    test('cardinality of one', () => {
      const result = blogSelectors.getAttachedArr(blogState, {
        entity: 'author',
        id: 'a1',
        rel: 'articleIds'
      });

      const expected = ['r1', 'r2'];

      expect(result).toEqual(expected);
    });

    test('cardinality of many', () => {
      const result = blogSelectors.getAttachedArr(blogState, {
        entity: 'article',
        id: 'r1',
        rel: 'authorId'
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
            postIds: ['o1', 'o2']
          },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        profile: ['p1']
      }
    };

    const result = forumSelectors.getEntityAttachedArr(state, { entity: 'profile', id: 'p1' });

    const expected = {
      accountId: ['a1'],
      postIds: ['o1', 'o2']
    };

    expect(result).toEqual(expected);
  });
});
