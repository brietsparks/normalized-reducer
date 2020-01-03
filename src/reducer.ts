import {
  AbstractEntityState,
  AbstractState,
  Action,
  ActionTypes, AddRelIdOp, AddResourceOp, Cardinalities,
  DeriveActionWithOps,
  EntityReducer,
  EntityReducers, Op,
  OpTypes, RemoveRelIdOp,
  RemoveResourceOp,
} from './types';
import { EntitySchemaReader, ModelSchemaReader } from './schema';
import { arrayPut } from './util';

export const makeReducer = <S extends AbstractState>(
  schema: ModelSchemaReader<S>,
  actionTypes: ActionTypes,
  transformAction: DeriveActionWithOps
) => {
  const entities = schema.getEntities();

  const entityReducers = entities.reduce<EntityReducers>((reducers, entity) => {
    reducers[entity] = makeEntityReducer(schema.entity(entity));
    return reducers;
  }, {});

  return (state: S = schema.getEmptyState(), anyAction: { type: string }) => {
    if (!Object.keys(actionTypes).includes(anyAction.type)) {
      return state;
    }

    const action = anyAction as Action;

    const actionWithOps = transformAction(state, action);

    return Object.keys(entityReducers).reduce((reducedState: S, entity: string) => {
      const entityReducer = entityReducers[entity];

      // @ts-ignore // todo: typescript type incompatibility
      reducedState[entity] = entityReducer(state[entity], actionWithOps.ops || []);
      return reducedState;
    }, state)
  };
};


export const makeEntityReducer = <S extends AbstractState> (schema: EntitySchemaReader<S>): EntityReducer => {
  return (state= {}, ops: Op[] = []) => {
    return ops.reduce((state, op) => {
      if (op.entity !== schema.getEntity()) {
        return state;
      }

      if (op.opType === OpTypes.ADD_RESOURCE) {
        const addResourceOp = op as AddResourceOp;

        if (state[addResourceOp.id]) {
          return state;
        }

        return {
          ...state,
          [addResourceOp.id]: schema.getEmptyResourceState()
        }
      }

      if (op.opType === OpTypes.REMOVE_RESOURCE) {
        const removeResourceOp = op as RemoveResourceOp;

        if (!state[removeResourceOp.id]) {
          return state;
        }

        const newState = { ...state };
        delete newState[op.id];
        return newState;
      }

      if (op.opType === OpTypes.ADD_REL_ID) {
        const { id, rel, relId, index } = op as AddRelIdOp;
        const cardinality = schema.getCardinality(rel);

        let resource = state[id];

        if (!resource) {
          return state;
        }

        if (cardinality === Cardinalities.ONE) {
          return {
            ...state,
            [id]: { ...state[id], [rel]: relId }
          };
        }

        if (!resource.hasOwnProperty(rel)) {
          return {
            ...state,
            [id]: { ...state[id], [rel]: [relId] }
          };
        }

        let relState = state[id][rel] as string[];
        relState = [...relState];
        arrayPut(relState, relId, index);

        return {
          ...state,
          [id]: { ...state[id], [rel]: relState }
        }
      }

      if (op.opType === OpTypes.REMOVE_REL_ID) {
        const { id, rel, relId } = op as RemoveRelIdOp;

        const cardinality = schema.getCardinality(rel);

        let resource = state[id];
        if (!resource) {
          return state;
        }

        if (!resource.hasOwnProperty(rel)) {
          return state;
        }

        if (cardinality === Cardinalities.ONE) {
          if (relId !== resource[rel]) {
            return state;
          }

          return {
            ...state,
            [id]: { ...state[id], [rel]: undefined }
          };
        }

        const relState = state[id][rel] as string[];

        return {
          ...state,
          [id]: {
            ...state[id],
            [rel]: relState.filter(existingRelId => existingRelId !== relId)
          }
        };
      }

      return state;
    }, state);
  }
};
