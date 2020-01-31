import {
  State,
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
  IdsByEntityState,
  MoveResourceOp,
  EntityIdsReducers,
  ResourcesByEntityState,
} from './types';
import { EntitySchemaReader, ModelSchemaReader } from './schema';
import { arrayMove, arrayPut } from './util';

export const makeReducer = (
  schema: ModelSchemaReader,
  actionTypes: ActionTypes,
  transformAction: DeriveActionWithOps
) => {
  const idsByEntityReducer = makeIdsByEntityReducer(schema);
  const resourcesByEntityReducer = makeResourcesByEntityReducer(schema);

  return (state: State = schema.getEmptyState(), anyAction: Action) => {
    if (!Object.values(actionTypes).includes(anyAction.type)) {
      return state;
    }

    const opAction = anyAction as OpAction;
    const actionWithOps = transformAction(state, opAction);

    return {
      ids: idsByEntityReducer(state.ids, actionWithOps),
      resources: resourcesByEntityReducer(state.resources, actionWithOps),
    };
  };
};

export const makeIdsByEntityReducer = (schema: ModelSchemaReader) => {
  const entities = schema.getEntities();

  const idsReducers = entities.reduce<EntityIdsReducers>((reducers, entity) => {
    reducers[entity] = makeIdsReducer(schema.entity(entity));
    return reducers;
  }, {});

  return (
    state: IdsByEntityState = schema.getEmptyIdsByEntityState(),
    action: OpAction
  ) => {
    return Object.keys(idsReducers).reduce(
      (reducedState: IdsByEntityState, entity: string) => {
        const newReducedState = { ...reducedState };
        const entityReducer = idsReducers[entity];
        newReducedState[entity] = entityReducer(
          newReducedState[entity],
          action.ops || []
        );
        return newReducedState;
      },
      state
    );
  };
};

export const makeIdsReducer = (schema: EntitySchemaReader) => {
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

export const makeResourcesByEntityReducer = (schema: ModelSchemaReader) => {
  const entities = schema.getEntities();

  const resourcesReducers = entities.reduce<EntityReducers>(
    (reducers, entity) => {
      reducers[entity] = makeResourcesReducer(schema.entity(entity));
      return reducers;
    },
    {}
  );

  return (
    state: ResourcesByEntityState = schema.getEmptyResourcesByEntityState(),
    action: OpAction
  ) => {
    return Object.keys(resourcesReducers).reduce(
      (reducedState: ResourcesByEntityState, entity: string) => {
        const newReducedState = { ...reducedState };
        const entityReducer = resourcesReducers[entity];
        newReducedState[entity] = entityReducer(
          newReducedState[entity],
          action.ops || []
        );
        return newReducedState;
      },
      state
    );
  };
};

export const makeResourcesReducer = (
  schema: EntitySchemaReader
): EntityReducer => {
  // the state is all the resources of a given entity
  return (state = {}, ops: Op[] = []) => {
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
          [addResourceOp.id]:
            addResourceOp.data || schema.getEmptyResourceState(),
        };
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
            [id]: { ...state[id], [rel]: relId },
          };
        }

        if (!resource.hasOwnProperty(rel)) {
          return {
            ...state,
            [id]: { ...state[id], [rel]: [relId] },
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
          [id]: { ...state[id], [rel]: relState },
        };
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
          [id]: newResource,
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
            [id]: { ...state[id], [rel]: undefined },
          };
        }

        const relState = state[id][rel] as string[];

        return {
          ...state,
          [id]: {
            ...state[id],
            [rel]: relState.filter(existingRelId => existingRelId !== relId),
          },
        };
      }

      if (op.opType === OpTypes.MOVE_REL_ID) {
        const { id, rel, src, dest } = op as MoveRelIdOp;

        const cardinality = schema.getCardinality(rel);

        let resource = state[id];

        if (
          !resource ||
          !resource.hasOwnProperty(rel) ||
          cardinality === Cardinalities.ONE
        ) {
          return state;
        }

        let relState = state[id][rel] as string[];
        relState = [...relState];
        arrayMove(relState, src, dest);

        return {
          ...state,
          [id]: {
            ...state[id],
            [rel]: relState,
          },
        };
      }

      return state;
    }, state);
  };
};
