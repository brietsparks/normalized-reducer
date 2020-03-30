import { Profile, ForumState, forumSelectors, forumEmptyState } from '../src/test-cases';

import { Id } from '../src';

describe('selectors', () => {
  describe('getEntity', () => {
    it('returns undefined if the type does not exist', () => {
      const state = {
        entities: {
          chicken: {
            c1: { name: 'nugget' },
          },
        },
        ids: {
          chicken: ['c1'],
        },
      };
      const result = forumSelectors.getEntity(state, {
        type: 'chicken',
        id: 'c1',
      });

      expect(result).toEqual(undefined);
    });

    it('returns an entity given its type and id', () => {
      const state: ForumState = {
        entities: {
          ...forumEmptyState.entities,
          profile: {
            p1: { firstName: 'Dwight', lastName: 'Schrute' },
            p2: {},
          },
        },
        ids: {
          ...forumEmptyState.ids,
          profile: ['p1', 'p2'],
        },
      };

      const result = forumSelectors.getEntity<Profile>(state, {
        type: 'profile',
        id: 'p1',
      });

      const expected = state.entities.profile['p1'];

      expect(result).toEqual(expected);
    });
  });

  describe('getAttached', () => {
    const state: ForumState = {
      entities: {
        ...forumEmptyState.entities,
        account: {
          a1: { profileId: 'p1' },
        },
        profile: {
          p1: { accountId: 'a1', postIds: ['o1'] },
        },
        post: {
          o1: { profileId: 'p1' },
        },
      },
      ids: {
        ...forumEmptyState.ids,
        account: ['a1'],
        profile: ['p1'],
        post: ['o1'],
      },
    };

    it('returns undefined if the entity type does not exist', () => {
      const state = {
        entities: {
          account: {
            a1: { chickenId: 'c1' },
          },
          chicken: {
            c1: { accountId: 'a1' },
          },
        },
        ids: {
          account: ['a1'],
          chicken: ['c1'],
        },
      };

      const result = forumSelectors.getAttached<Id>(state, {
        type: 'chicken',
        id: 'c1',
        relation: 'accountId',
      });

      expect(result).toEqual(undefined);
    });

    it('returns undefined if the relation does not exist', () => {
      const result = forumSelectors.getAttached<Id>(state, {
        type: 'post',
        id: 'p1',
        relation: 'accountId',
      });

      expect(result).toEqual(undefined);
    });

    it('returns undefined if the entity does not exist', () => {
      let result;

      result = forumSelectors.getAttached<Id>(state, {
        type: 'post',
        id: 'p900',
        relation: 'profileId',
      });
      expect(result).toEqual(undefined);

      result = forumSelectors.getAttached<Id>(state, {
        type: 'post',
        id: 'p900',
        relation: 'profile',
      });
      expect(result).toEqual(undefined);
    });

    it('returns the id of a one-related entity', () => {
      let result,
        expected = 'a1';

      result = forumSelectors.getAttached<Id>(state, {
        type: 'profile',
        id: 'p1',
        relation: 'accountId',
      });
      expect(result).toEqual(expected);

      result = forumSelectors.getAttached<Id>(state, {
        type: 'profile',
        id: 'p1',
        relation: 'account',
      });
      expect(result).toEqual(expected);
    });

    it('returns the id of a many-related entity', () => {
      let result,
        expected = ['o1'];

      result = forumSelectors.getAttached<Id>(state, {
        type: 'profile',
        id: 'p1',
        relation: 'postIds',
      });
      expect(result).toEqual(expected);

      result = forumSelectors.getAttached<Id>(state, {
        type: 'profile',
        id: 'p1',
        relation: 'post',
      });
      expect(result).toEqual(expected);
    });
  });

  describe('getAllAttached', () => {
    it('returns an empty object literal if the entity type does not exist', () => {
      const state = {
        entities: {
          account: {
            a1: { chickenId: 'c1' },
          },
          chicken: {
            c1: { accountId: 'a1' },
          },
        },
        ids: {
          account: ['a1'],
          chicken: ['c1'],
        },
      };

      const result = forumSelectors.getAllAttachedIds(state, {
        type: 'chicken',
        id: 'c1',
      });

      expect(result).toEqual({});
    });

    it('returns an object literal mapping an each relation key to an array of ids', () => {
      // note: this is invalid state because post o1's attached entities don't actually exist
      const state: ForumState = {
        entities: {
          ...forumEmptyState.entities,
          post: {
            o1: {
              profileId: 'p1',
              categoryIds: ['c1', 'c2'],
              tagIds: [],
              title: 'Post 1',
            },
          },
        },
        ids: {
          ...forumEmptyState.ids,
          post: ['o1'],
        },
      };

      const result = forumSelectors.getAllAttachedIds(state, {
        type: 'post',
        id: 'o1',
      });

      const expected = {
        profileId: ['p1'],
        categoryIds: ['c1', 'c2'],
        tagIds: [],
      };

      expect(result).toEqual(expected);
    });
  });
});
