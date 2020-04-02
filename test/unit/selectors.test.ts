import { Profile, ForumState, forumEmptyState, forumModelSchemaReader } from '../../src/test-cases';
import { makeSelectors } from '../../src/selectors';

import { Id } from '../../src';

const forumSelectors = makeSelectors(forumModelSchemaReader);

describe('unit/selectors', () => {
  const state = {
    entities: {
      ...forumEmptyState.entities,
      post: {
        o1: {},
        o2: {},
      },
    },
    ids: {
      ...forumEmptyState.ids,
      post: ['o1', 'o2'],
    },
  };

  describe('getIds', () => {
    it('returns an empty array if the type does not exist in the schema', () => {
      const result = forumSelectors.getIds(state, { type: 'chicken' });
      expect(result).toEqual([]);
    });

    it('returns the id collection of an entity type', () => {
      const result = forumSelectors.getIds(state, { type: 'post' });
      expect(result).toEqual(['o1', 'o2']);
    });
  });

  describe('getEntities', () => {
    it('returns an empty object literal if the type does not exist in the schema', () => {
      const result = forumSelectors.getEntities(state, { type: 'chicken' });
      expect(result).toEqual({});
    });

    it('returns the entity collection of an entity type', () => {
      const result = forumSelectors.getEntities(state, { type: 'post' });
      expect(result).toEqual({ o1: {}, o2: {} });
    });
  });

  describe('getEntity', () => {
    it('returns undefined if the type does not exist in the schema', () => {
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

    it('returns undefined if the entity does not exist in state', () => {
      const result = forumSelectors.getEntity(state, { type: 'post', id: 'p900' });
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
      };

      expect(result).toEqual(expected);
    });
  });

  describe('getEntityTree', () => {
    it('returns a collection of entity nodes given a non-recursive selector-schema', () => {
      const state: ForumState = {
        entities: {
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

      const result = forumSelectors.getEntityTree(state, {
        type: 'account',
        id: 'a1',
        schema,
      });

      const expected = [
        { type: 'account', id: 'a1', entity: { profileId: 'p1' } },
        {
          type: 'profile',
          id: 'p1',
          entity: { accountId: 'p1', postIds: ['o1', 'o2'] },
        },
        {
          type: 'post',
          id: 'o1',
          entity: { profileId: 'p1', categoryIds: ['c1'], tagIds: ['t1'] },
        },
        { type: 'tag', id: 't1', entity: { postIds: ['o1'] } },
        { type: 'category', id: 'c1', entity: { postIds: ['o1', 'o2'] } },
        {
          type: 'post',
          id: 'o2',
          entity: { profileId: 'p1', categoryIds: ['c1', 'c2'] },
        },
        { type: 'category', id: 'c2', entity: { postIds: ['o2', 'o3'] } },
      ];

      expect(result).toEqual(expected);
    });

    it('returns a collection of entity nodes given a recursive selector-schema', () => {
      const state: ForumState = {
        entities: {
          ...forumEmptyState.entities,
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

      const result = forumSelectors.getEntityTree(state, {
        type: 'post',
        id: 'o1',
        schema,
      });

      const expected = [
        { type: 'post', id: 'o1', entity: { childIds: ['o1.1', 'o1.2'] } },
        {
          type: 'post',
          id: 'o1.1',
          entity: { parentId: 'o1', childIds: ['o1.1.1', 'o1.1.2'] },
        },
        { type: 'post', id: 'o1.1.1', entity: { parentId: 'o1.1' } },
        { type: 'post', id: 'o1.1.2', entity: { parentId: 'o1.1' } },
        { type: 'post', id: 'o1.2', entity: { parentId: 'o1' } },
      ];

      expect(result).toEqual(expected);
    });
  });
});
