import {
  State,
  EntityState,
  OpAction,
  ActionTypes,
  AddRelIdOp,
  AddResourceOp,
  Cardinalities,
  DeriveActionWithOps,
  EntityReducer,
  EntityReducers,
  MoveRelIdOp,
  Op,
  OpTypes,
  RemoveRelIdOp,
  RemoveResourceOp,
  Action,
  EditResourceOp,
  IdsState,
  MoveResourceOp,
  EntityIdsReducers,
  EntityIdsReducer, EntitiesState,
} from './types';
import { EntitySchemaReader, ModelSchemaReader } from './schema';
import { arrayMove, arrayPut, deepFreeze } from './util';

export const makeReducer = (
  schema: ModelSchemaReader,
  actionTypes: ActionTypes,
  transformAction: DeriveActionWithOps
) => {
  const idsReducer = makeIdsReducer(schema);
  const entitiesReducer = makeEntitiesReducer(schema);

  return (state: State = schema.getEmptyState(), anyAction: Action) => {
    deepFreeze(state);

    if (!Object.values(actionTypes).includes(anyAction.type)) {
      return state;
    }

    const opAction = anyAction as OpAction;
    const actionWithOps = transformAction(state, opAction);

    return ({
      ids: idsReducer(state.ids, actionWithOps),
      entities: entitiesReducer(state.entities, actionWithOps),
    })
  }
};

export const makeIdsReducer = (schema: ModelSchemaReader) => {
  const entities = schema.getEntities();

  const idsReducers = entities.reduce<EntityIdsReducers>((reducers, entity)  =>{
    reducers[entity] = makeEntityIdsReducer(schema.entity(entity));
    return reducers;
  }, {});

  return (state: IdsState = schema.getEmptyIdsState(), action: OpAction) => {
    return Object.keys(idsReducers).reduce((reducedState: IdsState, entity: string) => {
      const newReducedState = {...reducedState};
      const entityReducer = idsReducers[entity];
      newReducedState[entity] = entityReducer(newReducedState[entity], action.ops || []);
      return newReducedState;
    }, state)
  };
};

export const makeEntityIdsReducer = (schema: EntitySchemaReader) => {
  return (state: string[] = [], ops: Op[] = []) => {
    return ops.reduce((state, op) => {
      if (op.entity !== schema.getEntity()) {
        return state;
      }

      if (op.opType === OpTypes.ADD_RESOURCE) {
        const { id, index } = op as AddResourceOp;
        const newState = [...state];
        arrayPut(newState, id, index);
        return newState;
      }

      if (op.opType === OpTypes.REMOVE_RESOURCE) {
        const { id } = op as RemoveResourceOp;
        return state.filter(existingId => existingId !== id);
      }

      if (op.opType === OpTypes.MOVE_RESOURCE) {
        const { src, dest } = op as MoveResourceOp;
        const newState = [...state];
        arrayMove(newState, src, dest);
        return newState;
      }

      return state;
    }, state);
  };
};

export const makeEntitiesReducer = (schema: ModelSchemaReader) => {
  const entities = schema.getEntities();

  const entityReducers = entities.reduce<EntityReducers>((reducers, entity) => {
    reducers[entity] = makeEntityReducer(schema.entity(entity));
    return reducers;
  }, {});

  return (state: EntitiesState = schema.getEmptyEntitiesState(), action: OpAction) => {
    return Object.keys(entityReducers).reduce((reducedState: EntitiesState, entity: string) => {
      const newReducedState = {...reducedState};
      const entityReducer = entityReducers[entity];
      newReducedState[entity] = entityReducer(newReducedState[entity], action.ops || []);
      return newReducedState;
    }, state)
  };
};


export const makeEntityReducer = (schema: EntitySchemaReader): EntityReducer => {
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
        delete newState[removeResourceOp.id];
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

      if (op.opType === OpTypes.EDIT_RESOURCE) {
        const { id, data } = op as EditResourceOp;

        let resource = state[id];

        if (!resource) {
          return state;
        }

        const newResource = { ...resource };

        Object.entries(data).forEach(([key, value]) => {
          newResource[key] = data[key] = value;
        });

        return {
          ...state,
          [id]: newResource
        };
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
