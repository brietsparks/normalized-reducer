import { blogModelSchemaReader } from './test-cases/blog';
import { forumModelSchemaReader } from './test-cases/forum';
import { Cardinalities } from '../src';

describe('schema', () => {
  describe('entity', () => {
    test('getReciprocalCardinality', () => {
      expect(
        blogModelSchemaReader
          .entity('author')
          .getReciprocalCardinality('articleIds')
      ).toEqual(Cardinalities.ONE);

      expect(
        blogModelSchemaReader
          .entity('article')
          .getReciprocalCardinality('authorId')
      ).toEqual(Cardinalities.MANY);
    });

    test('getEmptyResourceState', () => {
      expect(
        blogModelSchemaReader.entity('author').getEmptyResourceState()
      ).toEqual({ articleIds: [] });

      expect(
        blogModelSchemaReader.entity('article').getEmptyResourceState()
      ).toEqual({ authorId: undefined });
    });

    test('getEmptyRelState ', () => {
      expect(
        blogModelSchemaReader.entity('author').getEmptyRelState('articleIds')
      ).toEqual([]);
      expect(
        blogModelSchemaReader.entity('article').getEmptyRelState('authorId')
      ).toEqual(undefined);
    });

    describe('relIsValid', () => {
      test('with resolving rel from entity', () => {
        expect(
          forumModelSchemaReader.entity('post').relIsValid('profileId', true)
        ).toEqual(true);
        expect(
          forumModelSchemaReader.entity('post').relIsValid('accountId', true)
        ).toEqual(false);
        expect(
          forumModelSchemaReader.entity('post').relIsValid('profile', true)
        ).toEqual(true);
        expect(
          forumModelSchemaReader.entity('post').relIsValid('post', true)
        ).toEqual(false);
      });

      test('without resolving rel from entity', () => {
        expect(
          forumModelSchemaReader.entity('post').relIsValid('profileId', false)
        ).toEqual(true);
        expect(
          forumModelSchemaReader.entity('post').relIsValid('accountId', false)
        ).toEqual(false);
        expect(
          forumModelSchemaReader.entity('post').relIsValid('profile', false)
        ).toEqual(false);
        expect(
          forumModelSchemaReader.entity('post').relIsValid('post', false)
        ).toEqual(false);
      });
    });

    describe('getRel', () => {
      test('with resolving rel from entity', () => {
        expect(
          forumModelSchemaReader.entity('post').resolveRel('profileId', true)
        ).toEqual('profileId');
        expect(
          forumModelSchemaReader.entity('post').resolveRel('accountId', true)
        ).toEqual(undefined);
        expect(
          forumModelSchemaReader.entity('post').resolveRel('profile', true)
        ).toEqual('profileId');
        expect(
          forumModelSchemaReader.entity('post').resolveRel('post', true)
        ).toEqual(undefined);
      });

      test('without resolving rel from entity', () => {
        expect(
          forumModelSchemaReader.entity('post').resolveRel('profileId', false)
        ).toEqual('profileId');
        expect(
          forumModelSchemaReader.entity('post').resolveRel('accountId', false)
        ).toEqual(undefined);
        expect(
          forumModelSchemaReader.entity('post').resolveRel('profile', false)
        ).toEqual(undefined);
        expect(
          forumModelSchemaReader.entity('post').resolveRel('post', false)
        ).toEqual(undefined);
      });
    });
  });

  test('model getEmptyState', () => {
    const result = blogModelSchemaReader.getEmptyState();

    const expected = {
      resources: {
        author: {},
        article: {},
      },
      ids: {
        author: [],
        article: [],
      },
    };

    expect(result).toEqual(expected);
  });
});
