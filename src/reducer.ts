import {
  AbstractEntityState,
  AbstractState,
  OpAction,
  ActionTypes, AddRelIdOp, AddResourceOp, Cardinalities,
  DeriveActionWithOps,
  EntityReducer,
  EntityReducers, MoveRelIdOp, Op,
  OpTypes, RemoveRelIdOp,
  RemoveResourceOp, Action, SetStateAction, SetEntityState, SetResourceState, SetRelState,
} from './types';
import { EntitySchemaReader, ModelSchemaReader } from './schema';
import { arrayMove, arrayPut, deepFreeze } from './util';

export const makeReducer = <S extends AbstractState>(
  schema: ModelSchemaReader<S>,
  actionTypes: ActionTypes,
  transformAction: DeriveActionWithOps<S>
) => {
  const entities = schema.getEntities();

  const entityReducers = entities.reduce<EntityReducers>((reducers, entity) => {
    reducers[entity] = makeEntityReducer(schema.entity(entity));
    return reducers;
  }, {});

  return (state: S = schema.getEmptyState(), anyAction: Action) => {
    if (!Object.values(actionTypes).includes(anyAction.type)) {
      return state;
    }

    //
    // handle state setter actions
    //
    if (anyAction.type === actionTypes.SET_STATE) {
      const action = anyAction as SetStateAction<S>;
      return action.state;
    }

    if (anyAction.type === actionTypes.SET_ENTITY_STATE) {
      const action = anyAction as SetEntityState;

      if (!schema.entityExists(action.entity)) {
        return state;
      }

      return {
        ...state,
        [action.entity]: action.state
      };
    }

    if (anyAction.type === actionTypes.SET_RESOURCE_STATE) {
      const action = anyAction as SetResourceState;

      if (!schema.entityExists(action.entity)) {
        return state;
      }

      return {
        ...state,
        [action.entity]: {
          ...state[action.entity],
          [action.id]: action.state
        }
      };
    }

    if (anyAction.type === actionTypes.SET_REL_STATE) {
      const action = anyAction as SetRelState;

      if (!schema.entityExists(action.entity)) {
        return state;
      }

      const resource = state[action.entity][action.id] || {};

      return {
        ...state,
        [action.entity]: {
          ...state[action.entity],
          [action.id]: {
            ...resource,
            [action.rel]: action.state,
          }
        }
      };
    }

    //
    // handle entity operations
    //

    const opAction = anyAction as OpAction;
    const actionWithOps = transformAction(state, opAction);

    return Object.keys(entityReducers).reduce((reducedState: S, entity: string) => {
      const newReducedState = {...reducedState};

      const entityReducer = entityReducers[entity];

      // @ts-ignore // todo: typescript type incompatibility
      newReducedState[entity] = entityReducer(newReducedState[entity], actionWithOps.ops || []);
      return newReducedState;
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
          [addResourceOp.id]: addResourceOp.data || schema.getEmptyResourceState()
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

        if (relState.includes(relId)) {
          return state;
        }

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

        if (!resource || !resource.hasOwnProperty(rel)) {
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

      if (op.opType === OpTypes.MOVE_REL_ID) {
        const { id, rel, src, dest } = op as MoveRelIdOp;

        const cardinality = schema.getCardinality(rel);

        let resource = state[id];

        if (!resource || !resource.hasOwnProperty(rel) || cardinality === Cardinalities.ONE) {
          return state;
        }

        let relState = state[id][rel] as string[];
        relState = [...relState];
        arrayMove(relState, src, dest);

        return {
          ...state,
          [id]: {
            ...state[id],
            [rel]: relState
          }
        };
      }

      return state;
    }, state);
  }
};
