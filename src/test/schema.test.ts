import { blogModelSchemaReader } from './test-cases/blog';
import { Cardinalities } from '../types';

describe('schema', () => {
  describe('entity', () => {
    test('getReciprocalCardinality', () => {
      expect(
        blogModelSchemaReader.entity('author').getReciprocalCardinality('articleIds')
      ).toEqual(Cardinalities.ONE);

      expect(
        blogModelSchemaReader.entity('article').getReciprocalCardinality('authorId')
      ).toEqual(Cardinalities.MANY);
    });

    test('getEmptyResourceState', () => {
      expect(
        blogModelSchemaReader.entity('author').getEmptyResourceState()
      ).toEqual(
        { articleIds: [] }
      );

      expect(
        blogModelSchemaReader.entity('article').getEmptyResourceState()
      ).toEqual(
        { authorId: undefined }
      );
    });

    test('getEmptyRelState ', () => {
      expect(blogModelSchemaReader.entity('author').getEmptyRelState('articleIds')).toEqual([]);
      expect(blogModelSchemaReader.entity('article').getEmptyRelState('authorId')).toEqual(undefined);
    });
  });

  test('model getEmptyState', () => {
    const result = blogModelSchemaReader.getEmptyState();

    const expected = {
      author: {},
      article: {}
    };

    expect(result).toEqual(expected);
  });
});
