import {
  forumActionTypes,
  forumActionCreators,
  forumModelSchemaReader,
  allForumSelectors,
  ForumEntities,
  forumEmptyState,
  ForumState,
} from '../../src/test-cases';

import { DetachAction, DerivedAction, AttachAction, DeleteAction, MoveAction } from '../../src';

import { Derivator } from '../../src/derivator';

describe('unit/derivator', () => {
  const derivator = new Derivator<ForumState>(
    forumActionTypes,
    forumActionCreators,
    forumModelSchemaReader,
    allForumSelectors
  );

  describe('given a detach-action', () => {
    const action: DetachAction = {
      type: forumActionTypes.DETACH,
      entityType: ForumEntities.PROFILE,
      id: 'p1',
      relation: ForumEntities.ACCOUNT,
      detachableId: 'a1',
    };

    const expectedDerivedAction: DerivedAction = {
      type: forumActionTypes.DETACH,
      original: action,
      derived: [
        action,
        {
          type: forumActionTypes.DETACH,
          entityType: ForumEntities.ACCOUNT,
          id: 'a1',
          relation: 'profileId',
          detachableId: 'p1',
        },
      ],
    };

    it('derives the detachment of two attached entities', () => {
      const state: ForumState = {
        entities: {
          ...forumEmptyState.entities,
          account: {
            a1: { profileId: 'p1' },
          },
          profile: {
            p1: { accountId: 'a1' },
          },
        },
        ids: {
          ...forumEmptyState.ids,
          account: ['a1'],
          profile: ['p1'],
        },
      };

      const derivedAction = derivator.deriveAction(state, action);

      expect(derivedAction).toEqual(expectedDerivedAction);
    });

    test('if the entity exists but not the attached entity, it still derives both detachments', () => {
      const state: ForumState = {
        entities: {
          ...forumEmptyState.entities,
          profile: {
            p1: {},
          },
        },
        ids: {
          ...forumEmptyState.ids,
          profile: ['p1'],
        },
      };

      const derivedAction = derivator.deriveAction(state, action);

      expect(derivedAction).toEqual(expectedDerivedAction);
    });

    test('if the entity does not exist, it still derives both detachments', () => {
      const derivedAction = derivator.deriveAction(forumEmptyState, action);

      expect(derivedAction).toEqual(expectedDerivedAction);
    });

    test('if the relation type does not exist, it derives a single detachment (no reciprocal detachment)', () => {
      const action: DetachAction = {
        type: forumActionTypes.DETACH,
        entityType: ForumEntities.PROFILE,
        id: 'p1',
        relation: 'chicken',
        detachableId: 'c1',
      };

      const derivedAction = derivator.deriveAction(forumEmptyState, action);

      expect(derivedAction).toEqual({
        type: forumActionTypes.DETACH,
        original: action,
        derived: [action],
      });
    });

    test('if the reciprocal key does not exist, it derives a single detachment (no reciprocal detachment)', () => {
      // no reciprocal key can be resolved for this action
      // because a post has multiple relation keys pointing to post
      const action: DetachAction = {
        type: forumActionTypes.DETACH,
        entityType: ForumEntities.POST,
        id: 'p1',
        relation: 'post',
        detachableId: 'p10',
      };

      const derivedAction = derivator.deriveAction(forumEmptyState, action);

      expect(derivedAction).toEqual({
        type: forumActionTypes.DETACH,
        original: action,
        derived: [action],
      });
    });
  });

  describe('given an attach-action', () => {
    it('derives a no-op if the entity does not exist', () => {
      const state: ForumState = {
        entities: {
          ...forumEmptyState.entities,
          profile: { p1: {} },
        },
        ids: {
          ...forumEmptyState.ids,
          profile: ['p1'],
        },
      };

      const action: AttachAction = {
        type: forumActionTypes.ATTACH,
        entityType: 'post',
        id: 'o900',
        relation: 'profile',
        attachableId: 'p1',
      };

      const derivedAction = derivator.deriveAction(state, action);

      const expected: DerivedAction<AttachAction> = {
        type: forumActionTypes.ATTACH,
        original: action,
        derived: [],
      };

      expect(derivedAction).toEqual(expected);
    });

    it('derives a no-op if the attachable entity does not exist', () => {
      const state: ForumState = {
        entities: {
          ...forumEmptyState.entities,
          post: { o1: {} },
        },
        ids: {
          ...forumEmptyState.ids,
          post: ['o1'],
        },
      };

      const action: AttachAction = {
        type: forumActionTypes.ATTACH,
        entityType: 'post',
        id: 'o1',
        relation: 'profile',
        attachableId: 'p900',
      };

      const derivedAction = derivator.deriveAction(state, action);

      const expected: DerivedAction<AttachAction> = {
        type: forumActionTypes.ATTACH,
        original: action,
        derived: [],
      };

      expect(derivedAction).toEqual(expected);
    });

    it('derives a no-op if two existing entities are not related', () => {
      const state: ForumState = {
        entities: {
          ...forumEmptyState.entities,
          account: { a1: {} },
          post: { o1: {} },
        },
        ids: {
          ...forumEmptyState.ids,
          account: ['a1'],
          post: ['o1'],
        },
      };

      const action: AttachAction = {
        type: forumActionTypes.ATTACH,
        entityType: 'post',
        id: 'o1',
        relation: 'account',
        attachableId: 'a1',
      };

      const derivedAction = derivator.deriveAction(state, action);

      const expected: DerivedAction<AttachAction> = {
        type: forumActionTypes.ATTACH,
        original: action,
        derived: [],
      };

      expect(derivedAction).toEqual(expected);
    });

    it('derives attach-actions for existing related entities', () => {
      const state: ForumState = {
        entities: {
          ...forumEmptyState.entities,
          profile: { p1: {} },
          post: { o1: {} },
        },
        ids: {
          ...forumEmptyState.ids,
          profile: ['p1'],
          post: ['o1'],
        },
      };

      const action: AttachAction = {
        type: forumActionTypes.ATTACH,
        entityType: 'post',
        id: 'o1',
        relation: 'profile',
        attachableId: 'p1',
      };

      const derivedAction = derivator.deriveAction(state, action);

      const expected: DerivedAction<AttachAction> = {
        type: forumActionTypes.ATTACH,
        original: action,
        derived: [
          action,
          {
            type: forumActionTypes.ATTACH,
            entityType: 'profile',
            id: 'p1',
            relation: 'postIds',
            attachableId: 'o1',
            index: undefined,
            reciprocalIndex: undefined,
          },
        ],
      };

      expect(derivedAction).toEqual(expected);
    });

    it('derives a detach-action for occupant entities', () => {
      const state: ForumState = {
        entities: {
          ...forumEmptyState.entities,
          account: {
            a1: { profileId: 'p1' },
            a20: { profileId: 'p20' },
          },
          profile: {
            p1: { accountId: 'a1' },
            p20: { accountId: 'a20' },
          },
        },
        ids: {
          ...forumEmptyState.ids,
          account: ['a1', 'a20'],
          profile: ['p1', 'p20'],
        },
      };

      const action: AttachAction = {
        type: forumActionTypes.ATTACH,
        entityType: 'account',
        id: 'a1',
        relation: 'profile',
        attachableId: 'p20',
      };

      const derivedAction = derivator.deriveAction(state, action);

      const expected: DerivedAction<AttachAction> = {
        type: forumActionTypes.ATTACH,
        original: action,
        derived: [
          action,
          {
            type: forumActionTypes.ATTACH,
            entityType: 'profile',
            id: 'p20',
            relation: 'accountId',
            attachableId: 'a1',
            index: undefined,
            reciprocalIndex: undefined,
          },
          {
            type: forumActionTypes.DETACH,
            entityType: 'account',
            id: 'a1',
            relation: 'profile',
            detachableId: 'p1',
          },
          {
            type: forumActionTypes.DETACH,
            entityType: 'profile',
            id: 'p1',
            relation: 'accountId',
            detachableId: 'a1',
          },
          {
            type: forumActionTypes.DETACH,
            entityType: 'profile',
            id: 'p20',
            relation: 'account',
            detachableId: 'a20',
          },
          {
            type: forumActionTypes.DETACH,
            entityType: 'account',
            id: 'a20',
            relation: 'profileId',
            detachableId: 'p20',
          },
        ],
      };

      expect(derivedAction).toEqual(expected);
    });

    it("does not derive detach-actions for an entity's many-collection", () => {
      const state: ForumState = {
        entities: {
          ...forumEmptyState.entities,
          post: {
            o1: { categoryIds: ['c1'] },
            o2: { categoryIds: ['c2'] },
          },
          category: {
            c1: { postIds: ['o1'] },
            c2: { postIds: ['o2'] },
          },
        },
        ids: {
          ...forumEmptyState.ids,
          post: ['o1', 'o2'],
          category: ['c1', 'c2'],
        },
      };

      const action: AttachAction = {
        type: forumActionTypes.ATTACH,
        entityType: 'post',
        id: 'o1',
        relation: 'category',
        attachableId: 'c2',
      };

      const derivedAction = derivator.deriveAction(state, action);

      const expected = {
        type: forumActionTypes.ATTACH,
        original: action,
        derived: [
          action,
          {
            type: forumActionTypes.ATTACH,
            entityType: 'category',
            id: 'c2',
            relation: 'postIds',
            attachableId: 'o1',
            index: undefined,
            reciprocalIndex: undefined,
          },
        ],
      };

      expect(derivedAction).toEqual(expected);
    });
  });

  describe('given a delete-action', () => {
    it('derives a no-op if the type does not exist', () => {
      const state = {
        entities: {
          ...forumEmptyState.entities,
          chicken: {
            c1: { name: 'nugget' },
          },
        },
        ids: {
          ...forumEmptyState.ids,
          chicken: ['c1'],
        },
      };

      const action = {
        type: forumActionTypes.DELETE,
        entityType: 'chicken',
        id: 'c1',
      };

      const result = derivator.deriveAction(state, action);

      const expected = {
        type: forumActionTypes.DELETE,
        original: action,
        derived: [],
      };

      expect(result).toEqual(expected);
    });

    it('derives a delete-action for an existing entity', () => {
      const state = {
        entities: {
          ...forumEmptyState.entities,
          post: {
            o1: {},
          },
        },
        ids: {
          ...forumEmptyState.ids,
          post: ['o1'],
        },
      };

      const action = {
        type: forumActionTypes.DELETE,
        entityType: 'post',
        id: 'o1',
      };

      const result = derivator.deriveAction(state, action);

      const expected = {
        type: forumActionTypes.DELETE,
        original: action,
        derived: [action],
      };

      expect(result).toEqual(expected);
    });

    it('derives a delete-action for a nonexistent entity', () => {
      const action = {
        type: forumActionTypes.DELETE,
        entityType: 'post',
        id: 'o1',
      };

      const result = derivator.deriveAction(forumEmptyState, action);

      const expected = {
        type: forumActionTypes.DELETE,
        original: action,
        derived: [action],
      };

      expect(result).toEqual(expected);
    });

    it('derives a detach-action for each attached entity', () => {
      const state: ForumState = {
        entities: {
          ...forumEmptyState.entities,
          profile: {
            p1: { postIds: ['o1'] },
          },
          post: {
            o1: {
              profileId: 'p1',
              categoryIds: ['c1'],
              childIds: ['o1.1'],
              title: 'First post',
            },
            'o1.1': {
              profileId: 'p1',
              parentId: 'o1',
            },
          },
          category: {
            c1: { postIds: ['p1'] },
          },
        },
        ids: {
          ...forumEmptyState.ids,
          profile: ['p1'],
          post: ['o1'],
          category: ['c1'],
        },
      };

      const action = {
        type: forumActionTypes.DELETE,
        entityType: 'post',
        id: 'o1',
      };

      const result = derivator.deriveAction(state, action);

      const expected = {
        type: forumActionTypes.DELETE,
        original: action,
        derived: [
          action,
          {
            type: forumActionTypes.DETACH,
            entityType: 'profile',
            id: 'p1',
            relation: 'postIds',
            detachableId: 'o1',
          },
          {
            type: forumActionTypes.DETACH,
            entityType: 'category',
            id: 'c1',
            relation: 'postIds',
            detachableId: 'o1',
          },
          {
            type: forumActionTypes.DETACH,
            entityType: 'post',
            id: 'o1.1',
            relation: 'parentId',
            detachableId: 'o1',
          },
        ],
      };

      expect(result).toEqual(expected);
    });

    it('derives delete-actions given a non-recursive deletion schema', () => {
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
            o1: { profileId: 'p1', categoryIds: ['c1'] },
          },
          category: {
            c1: { postIds: ['o1'] },
          },
        },
        ids: {
          ...forumEmptyState.ids,
          account: ['a1'],
          profile: ['p1'],
          post: ['o1'],
          category: ['c1'],
        },
      };

      const cascadeSchema = {
        profileId: {
          postIds: {},
        },
      };

      const action = forumActionCreators.delete('account', 'a1', cascadeSchema);

      const result = derivator.deriveAction(state, action) as DerivedAction<DeleteAction>;

      const expected = {
        type: forumActionTypes.DELETE,
        original: action,
        derived: [
          // a1 (original action)
          { type: forumActionTypes.DELETE, entityType: 'account', id: 'a1', cascadeSchema: undefined },
          {
            type: forumActionTypes.DETACH,
            entityType: 'profile',
            id: 'p1',
            relation: 'accountId',
            detachableId: 'a1',
          },

          // p1
          { type: forumActionTypes.DELETE, entityType: 'profile', id: 'p1', cascadeSchema: undefined },
          {
            type: forumActionTypes.DETACH,
            entityType: 'account',
            id: 'a1',
            relation: 'profileId',
            detachableId: 'p1',
          },
          {
            type: forumActionTypes.DETACH,
            entityType: 'post',
            id: 'o1',
            relation: 'profileId',
            detachableId: 'p1',
          },

          // o1
          { type: forumActionTypes.DELETE, entityType: 'post', id: 'o1', cascadeSchema: undefined },
          {
            type: forumActionTypes.DETACH,
            entityType: 'profile',
            id: 'p1',
            relation: 'postIds',
            detachableId: 'o1',
          },
          {
            type: forumActionTypes.DETACH,
            entityType: 'category',
            id: 'c1',
            relation: 'postIds',
            detachableId: 'o1',
          },
        ],
      };

      expect(result).toEqual(expected);
    });

    test('derives delete-actions given a recursive deletion schema', () => {
      const state: ForumState = {
        entities: {
          ...forumEmptyState.entities,
          profile: {
            p1: { postIds: ['o1'] },
          },
          post: {
            o1: {
              profileId: 'p1',
              childIds: ['o1.1'],
            },
            'o1.1': {
              profileId: 'p1',
              parentId: 'o1',
              childIds: ['o1.1.1', 'o1.1.2'],
              categoryIds: ['c1'],
            },
            'o1.1.1': {
              profileId: 'p1',
              parentId: 'o1.1',
            },
            'o1.1.2': {
              profileId: 'p1',
              parentId: 'o1.1',
            },
          },
          category: {
            c1: { postIds: ['o1'] },
          },
        },
        ids: {
          ...forumEmptyState.ids,
          profile: ['p1'],
          post: ['o1', 'o1.1', 'o1.1.1', 'o1.1.2'],
          category: ['c1'],
        },
      };

      const postCascadeSchema = () => ({ childIds: postCascadeSchema });
      const cascadeSchema = { postIds: postCascadeSchema };

      const action = forumActionCreators.delete('profile', 'p1', cascadeSchema);

      const result = derivator.deriveAction(state, action) as DerivedAction<DeleteAction>;

      const expected = {
        type: forumActionTypes.DELETE,
        original: action,
        derived: [
          // p1
          { type: forumActionTypes.DELETE, entityType: 'profile', id: 'p1', cascadeSchema: undefined },
          {
            type: forumActionTypes.DETACH,
            entityType: 'post',
            id: 'o1',
            relation: 'profileId',
            detachableId: 'p1',
          },

          // o1
          { type: forumActionTypes.DELETE, entityType: 'post', id: 'o1', cascadeSchema: undefined },
          {
            type: forumActionTypes.DETACH,
            entityType: 'profile',
            id: 'p1',
            relation: 'postIds',
            detachableId: 'o1',
          },
          {
            type: forumActionTypes.DETACH,
            entityType: 'post',
            id: 'o1.1',
            relation: 'parentId',
            detachableId: 'o1',
          },

          // o1.1
          { type: forumActionTypes.DELETE, entityType: 'post', id: 'o1.1', cascadeSchema: undefined },
          {
            type: forumActionTypes.DETACH,
            entityType: 'profile',
            id: 'p1',
            relation: 'postIds',
            detachableId: 'o1.1',
          },
          {
            type: forumActionTypes.DETACH,
            entityType: 'category',
            id: 'c1',
            relation: 'postIds',
            detachableId: 'o1.1',
          },
          {
            type: forumActionTypes.DETACH,
            entityType: 'post',
            id: 'o1',
            relation: 'childIds',
            detachableId: 'o1.1',
          },
          {
            type: forumActionTypes.DETACH,
            entityType: 'post',
            id: 'o1.1.1',
            relation: 'parentId',
            detachableId: 'o1.1',
          },
          {
            type: forumActionTypes.DETACH,
            entityType: 'post',
            id: 'o1.1.2',
            relation: 'parentId',
            detachableId: 'o1.1',
          },

          // o1.1.1
          { type: forumActionTypes.DELETE, entityType: 'post', id: 'o1.1.1', cascadeSchema: undefined },
          {
            type: forumActionTypes.DETACH,
            entityType: 'profile',
            id: 'p1',
            relation: 'postIds',
            detachableId: 'o1.1.1',
          },
          {
            type: forumActionTypes.DETACH,
            entityType: 'post',
            id: 'o1.1',
            relation: 'childIds',
            detachableId: 'o1.1.1',
          },

          // o1.1.2
          { type: forumActionTypes.DELETE, entityType: 'post', id: 'o1.1.2', cascadeSchema: undefined },
          {
            type: forumActionTypes.DETACH,
            entityType: 'profile',
            id: 'p1',
            relation: 'postIds',
            detachableId: 'o1.1.2',
          },
          {
            type: forumActionTypes.DETACH,
            entityType: 'post',
            id: 'o1.1',
            relation: 'childIds',
            detachableId: 'o1.1.2',
          },
        ],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('given any other action', () => {
    it('returns the action as-is', () => {
      const action: MoveAction = {
        type: forumActionTypes.MOVE,
        entityType: 'post',
        src: 3,
        dest: 1,
      };

      const result = derivator.deriveAction(forumEmptyState, action);

      expect(result).toEqual(action);
    });
  });
});
