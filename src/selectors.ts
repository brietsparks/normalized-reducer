import { ModelSchemaReader } from './schema';
import {
  Id,
  State,
  Selectors,
  Entity,
  GetAllAttachedIds,
  SelectorTreeSchema,
  EntityTreeNode,
  PublicSelectors,
  InternalSelectors,
} from './interfaces';

export const makeSelectors = <S extends State>(schema: ModelSchemaReader): Selectors<S> => {
  const getEntity = <E extends Entity>(state: S, args: { type: string; id: Id }): E | undefined => {
    const typeExists = schema.typeExists(args.type);
    if (!typeExists) {
      return undefined;
    }

    return state.entities[args.type][args.id] as E;
  };

  const getAttached = <E extends Id[] | Id>(
    state: S,
    args: { type: string; id: Id; relation: string }
  ): E | undefined => {
    const entitySchema = schema.type(args.type);
    if (!entitySchema) {
      return undefined;
    }

    const relationKey = entitySchema.resolveRelationKey(args.relation);
    if (!relationKey) {
      return undefined;
    }

    const entity = getEntity(state, args);

    if (!entity) {
      return undefined;
    }

    return entity[relationKey];
  };

  const getAttachedIds = (state: S, args: { type: string; id: Id; relation: string }) => {
    const { type, id, relation } = args;

    const relationKey = schema.type(type).resolveRelationKey(relation);

    if (!relationKey) {
      return [];
    }

    const attached = getAttached(state, { type, id, relation: relationKey });

    if (attached && typeof attached === 'string') {
      return [attached];
    }

    if (attached && Array.isArray(attached)) {
      return attached;
    }

    return [];
  };

  const getAllAttachedIds: GetAllAttachedIds<S> = (state, { type, id }) => {
    const entitySchema = schema.type(type);
    if (!entitySchema) {
      return {};
    }

    const allAttachedIds: { [relationKey: string]: Id[] } = {};

    const relationKeys = entitySchema.getRelationKeys();
    for (let relationKey of relationKeys) {
      const attachedIds = getAttachedIds(state, { type, id, relation: relationKey });
      if (attachedIds.length) {
        allAttachedIds[relationKey] = attachedIds;
      }
    }

    return allAttachedIds;
  };

  const getEntityTree = (
    state: S,
    args: { type: string; id: Id; schema: SelectorTreeSchema }
  ): EntityTreeNode[] => {
    const { type, id, schema: selectorSchema } = args;

    if (!schema.type(type)) {
      return [];
    }

    const rootEntity = getEntity<S>(state, { type, id });

    if (!rootEntity) {
      return [];
    }

    const nodes = recursivelyGetNodes(state, type, id, selectorSchema);

    return Object.values(nodes);
  };

  const recursivelyGetNodes = (
    state: S,
    type: string,
    id: Id,
    selectorSchema: SelectorTreeSchema,
    nodes: Record<string, EntityTreeNode> = {}
  ): Record<string, EntityTreeNode> => {
    const entity = getEntity(state, { type, id });

    if (!entity) {
      return nodes;
    }

    nodes[`${type}.${id}`] = { id, type, entity };

    if (typeof selectorSchema === 'function') {
      selectorSchema = selectorSchema();
    }

    for (let [relation, nestedSelectorSchema] of Object.entries(selectorSchema)) {
      const relationKey = schema.type(type).resolveRelationKey(relation);
      const relationType = schema.type(type).resolveRelationType(relation);

      if (relationKey && relationType) {
        const attachedIds = getAttachedIds(state, { type, id, relation: relationKey });
        for (let attachedId of attachedIds) {
          recursivelyGetNodes(state, relationType, attachedId, nestedSelectorSchema, nodes);
        }
      }
    }

    return nodes;
  };

  return {
    getEntity,
    getAttached,
    getAllAttachedIds,
    getEntityTree,
  };
};

export const getPublicSelectors = <S extends State>(selectors: Selectors<S>): PublicSelectors<S> => {
  const { getEntity } = selectors;
  return { getEntity };
};

export const getInternalSelectors = <S extends State>(selectors: Selectors<S>): InternalSelectors<S> => {
  const { getEntityTree, getAllAttachedIds, getAttached } = selectors;

  return {
    getEntityTree,
    getAllAttachedIds,
    getAttached,
  };
};
