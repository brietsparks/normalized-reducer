import { ModelSchemaReader } from './schema';
import { Id, State, Selectors, Entity, GetAllAttachedIds } from './interfaces';

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

  const getAllAttachedIds: GetAllAttachedIds<S> = (state, { type, id }) => {
    const entitySchema = schema.type(type);
    if (!entitySchema) {
      return {};
    }

    const allAttachedIds: { [relationKey: string]: Id[] } = {};

    const relationKeys = entitySchema.getRelationKeys();
    for (let relationKey of relationKeys) {
      const attached = getAttached(state, { type, id, relation: relationKey });

      if (attached && typeof attached === 'string') {
        allAttachedIds[relationKey] = [attached];
      }

      if (attached && Array.isArray(attached)) {
        allAttachedIds[relationKey] = attached;
      }
    }

    return allAttachedIds;
  };

  return {
    getEntity,
    getAttached,
    getAllAttachedIds,
  };
};
