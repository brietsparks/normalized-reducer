import { makeSelectors } from './selectors';
import { blogModelSchemaReader } from './schema.test';
import { BlogState, blogState } from './test-cases';
import { blogActionTypes, blogActionCreators } from './actions.test';

export const blogSelectors = makeSelectors(
  blogModelSchemaReader,
  blogActionCreators
);

describe('selectors', () => {
  describe('getArr', () => {
    test('cardinality of one', () => {
      const result = blogSelectors.getAttachedArr<BlogState>(blogState, {
        entity: 'author',
        id: 'a1',
        rel: 'articleIds'
      });

      const expected = ['r1', 'r2'];

      expect(result).toEqual(expected);
    });

    test('cardinality of many', () => {
      const result = blogSelectors.getAttachedArr<BlogState>(blogState, {
        entity: 'article',
        id: 'r1',
        rel: 'authorId'
      });

      const expected = ['a1'];

      expect(result).toEqual(expected);
    });
  });
});
