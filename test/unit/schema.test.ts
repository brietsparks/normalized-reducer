import { forumModelSchemaReader } from '../../src/test-cases';
import { Cardinalities } from '../../src/enums';

describe('unit/schema', () => {
  describe('entity schema', () => {
    describe('resolveRelationKey', () => {
      it('returns a relationKey given a existing relationKey', () => {
        const result = forumModelSchemaReader.type('post').resolveRelationKey('profileId');
        expect(result).toEqual('profileId');
      });

      it('returns undefined given a nonexistent relationKey', () => {
        const result = forumModelSchemaReader.type('post').resolveRelationKey('accountId');
        expect(result).toEqual(undefined);
      });

      it('returns a relationKey given an existing relationType', () => {
        const result = forumModelSchemaReader.type('post').resolveRelationKey('profile');
        expect(result).toEqual('profileId');
      });

      it('returns undefined given a nonexistent relationType', () => {
        const result = forumModelSchemaReader.type('post').resolveRelationKey('account');
        expect(result).toEqual(undefined);
      });

      it('returns undefined given an existing relationType that corresponds to multiple relationKeys', () => {
        const result = forumModelSchemaReader.type('post').resolveRelationKey('post');
        expect(result).toEqual(undefined);
      });
    });

    describe('resolveRelationType', () => {
      it('returns a relationType given an existing relationKey', () => {
        const result = forumModelSchemaReader.type('post').resolveRelationType('profileId');
        expect(result).toEqual('profile');
      });

      it('returns undefined given a nonexistent relationKey', () => {
        const result = forumModelSchemaReader.type('post').resolveRelationType('accountId');
        expect(result).toEqual(undefined);
      });

      it('returns a relationType given an existing relationType', () => {
        const result = forumModelSchemaReader.type('post').resolveRelationType('profile');
        expect(result).toEqual('profile');
      });

      it('returns undefined given a nonexistent relationType', () => {
        const result = forumModelSchemaReader.type('post').resolveRelationType('account');
        expect(result).toEqual(undefined);
      });
    });

    describe('resolveRelationReciprocalKey', () => {
      it('returns a reciprocal key given an existing relationKey', () => {
        let result;

        result = forumModelSchemaReader.type('post').resolveRelationReciprocalKey('profileId');
        expect(result).toEqual('postIds');

        result = forumModelSchemaReader.type('profile').resolveRelationReciprocalKey('postIds');
        expect(result).toEqual('profileId');
      });

      it('returns undefined given a nonexistent relationKey', () => {
        const result = forumModelSchemaReader.type('post').resolveRelationReciprocalKey('accountId');
        expect(result).toEqual(undefined);
      });

      it('returns a reciprocal key given an existing relationType', () => {
        let result;

        result = forumModelSchemaReader.type('post').resolveRelationReciprocalKey('profile');
        expect(result).toEqual('postIds');

        result = forumModelSchemaReader.type('profile').resolveRelationReciprocalKey('post');
        expect(result).toEqual('profileId');
      });

      it('returns undefined given a nonexistent relationType', () => {
        const result = forumModelSchemaReader.type('post').resolveRelationReciprocalKey('account');
        expect(result).toEqual(undefined);
      });

      it('returns undefined given an existing relationType that corresponds to multiple relationKeys', () => {
        const result = forumModelSchemaReader.type('post').resolveRelationReciprocalKey('post');
        expect(result).toEqual(undefined);
      });
    });

    describe('resolveReciprocalCardinality', () => {
      it('returns reciprocal cardinality given an existing relationKey', () => {
        let result;

        result = forumModelSchemaReader.type('post').resolveReciprocalCardinality('profileId');
        expect(result).toEqual(Cardinalities.MANY);

        result = forumModelSchemaReader.type('profile').resolveReciprocalCardinality('postIds');
        expect(result).toEqual(Cardinalities.ONE);
      });

      it('returns undefined given a nonexistent relationKey', () => {
        const result = forumModelSchemaReader.type('post').resolveReciprocalCardinality('accountId');
        expect(result).toEqual(undefined);
      });

      it('returns a reciprocal cardinality given an existing relationType', () => {
        let result;

        result = forumModelSchemaReader.type('post').resolveReciprocalCardinality('profile');
        expect(result).toEqual(Cardinalities.MANY);

        result = forumModelSchemaReader.type('profile').resolveReciprocalCardinality('post');
        expect(result).toEqual(Cardinalities.ONE);
      });

      it('returns undefined given a nonexistent relationType', () => {
        const result = forumModelSchemaReader.type('post').resolveReciprocalCardinality('account');
        expect(result).toEqual(undefined);
      });

      it('returns undefined given an existing relationType that corresponds to multiple relationKeys', () => {
        const result = forumModelSchemaReader.type('post').resolveReciprocalCardinality('post');
        expect(result).toEqual(undefined);
      });
    });

    describe('getEmptyResourceState', () => {
      it('it can return the empty-state of an entity with NO default relational attributes', () => {
        expect(forumModelSchemaReader.type('profile').getEmptyEntityState()).toEqual({});
      });

      it('it can return the empty-state of an entity WITH default relational attributes', () => {
        expect(forumModelSchemaReader.type('profile').getEmptyEntityState(true)).toEqual({
          accountId: undefined,
          postIds: [],
        });
      });
    });

    describe('getEmptyRelState ', () => {
      it('returns the empty-value of a relational attribute', () => {
        expect(forumModelSchemaReader.type('post').getEmptyRelationState('categoryIds')).toEqual([]);

        expect(forumModelSchemaReader.type('post').getEmptyRelationState('profileId')).toEqual(undefined);
      });
    });
  });

  describe('getEmptyState', () => {
    it('returns the empty-state', () => {
      const result = forumModelSchemaReader.getEmptyState();

      const expected = {
        entities: {
          account: {},
          profile: {},
          post: {},
          category: {},
          tag: {},
        },
        ids: {
          account: [],
          profile: [],
          post: [],
          category: [],
          tag: [],
        },
      };

      expect(result).toEqual(expected);
    });
  });
});
