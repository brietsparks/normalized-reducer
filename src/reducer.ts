import {
  Action,
  ActionTypes,
  AnyAction,
  AttachAction,
  BatchAction,
  CreateAction,
  DeleteAction,
  DerivedAction,
  DetachAction,
  EntitiesByType,
  Entity,
  Id,
  IdsByType,
  MoveAction,
  SingularAction,
  State,
  UpdateAction,
} from './interfaces';
import { ModelSchemaReader } from './schema';
import Derivator from './derivator';
import { ActionUtils } from './actions';
import { Cardinalities, UpdateActionMethod } from './enums';
import { arrayPut, arrayMove } from './util';

export const makeReducer = <S extends State>(
  schema: ModelSchemaReader,
  derivator: Derivator<S>,
  actionTypes: ActionTypes,
  actionUtils: ActionUtils
) => {
  function rootReducer(state: S, anyAction: AnyAction) {
    // if not handleable, then return state without changes
    if (!actionUtils.isHandleable(anyAction)) {
      return state;
    }

    let action = anyAction as Action;

    if (actionUtils.isBatch(action)) {
      // with a batch action, reduce iteratively
      const batchAction = action as BatchAction;
      return batchAction.actions.reduce((prevState: S, action: SingularAction) => {
        return singularReducer(prevState, action);
      }, state);
    } else {
      // with a singular action, reduce once
      return singularReducer(state, action);
    }
  }

  function singularReducer(state: S, action: SingularAction): S {
    if (actionUtils.isDerivable(action)) {
      const derivedAction = derivator.deriveAction(state, action) as DerivedAction;

      // a derived action can have other actions that need
      // to be handled in the same run, so reduce iteratively
      return derivedAction.derived.reduce((prevState: S, childAction: SingularAction) => {
        return {
          entities: entitiesReducer(prevState.entities, childAction),
          ids: idsReducer(prevState.ids, childAction),
        } as S;
      }, state);
    }

    return {
      entities: entitiesReducer(state.entities, action),
      ids: idsReducer(state.ids, action),
    } as S;
  }

  const defaultEntitiesState = schema.getEmptyEntitiesByTypeState();
  function entitiesReducer(
    state: EntitiesByType = defaultEntitiesState,
    action: SingularAction
  ): EntitiesByType {
    if (action.type === actionTypes.INVALID) {
      return state;
    }

    if (action.type === actionTypes.DETACH) {
      const { entityType, id, detachableId, relation } = action as DetachAction;

      if (!schema.typeExists(entityType)) {
        return state; // if no such entityType, then no change
      }

      const entity = state[entityType][id] as Entity;
      if (!entity) {
        return state; // if entity not found, then no change
      }

      const relationKey = schema.type(entityType).resolveRelationKey(relation);
      if (!relationKey) {
        return state; // if entity relation key not found, then no change
      }

      let newEntity = entity; // to contain the change immutably

      const cardinality = schema.type(entityType).resolveRelationCardinality(relation);

      if (cardinality === Cardinalities.ONE) {
        const attachedId = entity[relationKey] as Id;

        if (detachableId !== attachedId) {
          return state; // if detachableId is not the attached id, then no change
        }

        // detach it: set the relation value to undefined
        newEntity = { ...entity, [relationKey]: undefined };
      }

      if (cardinality === Cardinalities.MANY) {
        const attachedIds = entity[relationKey] as Id[];

        // detach it: filter out the detachableId
        newEntity = {
          ...entity,
          [relationKey]: attachedIds.filter(attachedId => attachedId !== detachableId),
        };
      }

      return {
        ...state,
        [entityType]: {
          ...state[entityType],
          [id]: newEntity,
        },
      };
    }

    if (action.type === actionTypes.ATTACH) {
      const { entityType, id, attachableId, relation, index } = action as AttachAction;

      if (!schema.typeExists(entityType)) {
        return state; // if no such entityType, then no change
      }

      const entity = state[entityType][id] as Entity;
      if (!entity) {
        return state; // if entity not found, then no change
      }

      const relationKey = schema.type(entityType).resolveRelationKey(relation);
      if (!relationKey) {
        return state; // if entity relation key not found, then no change
      }

      let newEntity = entity; // to contain the change immutably

      const cardinality = schema.type(entityType).resolveRelationCardinality(relation);

      if (cardinality === Cardinalities.ONE) {
        newEntity = {
          ...newEntity,
          [relationKey]: attachableId,
        };
      }

      if (cardinality === Cardinalities.MANY) {
        if (!entity[relationKey] || !entity[relationKey].includes(attachableId)) {
          newEntity = {
            ...newEntity,
            [relationKey]: arrayPut(attachableId, newEntity[relationKey], index),
          };
        }
      }

      return {
        ...state,
        [entityType]: {
          ...state[entityType],
          [id]: newEntity,
        },
      };
    }

    if (action.type === actionTypes.DELETE) {
      const { entityType, id } = action as DeleteAction;

      if (!schema.typeExists(entityType)) {
        return state; // if no such entityType, then no change
      }

      const entity = state[entityType][id] as Entity;
      if (!entity) {
        return state; // if entity not found, then no change
      }

      const entitiesOfType = { ...state[entityType] };
      delete entitiesOfType[id];

      return {
        ...state,
        [entityType]: entitiesOfType,
      };
    }

    if (action.type === actionTypes.CREATE) {
      const { entityType, id, data } = action as CreateAction;

      if (!schema.typeExists(entityType)) {
        return state; // if no such entityType, then no change
      }

      const entity = state[entityType][id] as Entity;
      if (entity) {
        return state; // if entity exists, then no change
      }

      return {
        ...state,
        [entityType]: {
          ...state[entityType],
          [id]: data || {},
        },
      };
    }

    if (action.type === actionTypes.UPDATE) {
      const { entityType, id, data, method } = action as UpdateAction;

      if (!schema.typeExists(entityType)) {
        return state; // if no such entityType, then no change
      }

      const entity = state[entityType][id] as Entity;
      if (!entity) {
        return state; // if entity not found, then no change
      }

      const newEntity = method === UpdateActionMethod.PUT ? data : { ...entity, ...data };

      return {
        ...state,
        [entityType]: {
          ...state[entityType],
          [id]: newEntity,
        },
      };
    }

    return state;
  }

  const defaultIdsState = schema.getEmptyIdsByTypeState();
  function idsReducer(state: IdsByType = defaultIdsState, action: SingularAction): IdsByType {
    if (action.type === actionTypes.INVALID) {
      return state;
    }

    if (action.type === actionTypes.DELETE) {
      const { entityType, id } = action as DeleteAction;

      if (!schema.typeExists(entityType)) {
        return state; // if no such entityType, then no change
      }

      const idsOfEntity = state[entityType].filter(existingId => existingId !== id);

      return {
        ...state,
        [entityType]: idsOfEntity,
      };
    }

    if (action.type === actionTypes.CREATE) {
      const { entityType, id, index } = action as CreateAction;

      if (!schema.typeExists(entityType)) {
        return state; // if no such entityType, then no change
      }

      // this O(n) operation can be improved if existence is checked
      // in an O(c) lookup against the entities slice from one level up,
      // and then set the existence boolean on the action
      if (state[entityType].includes(id)) {
        return state; // if entity exists, then no change
      }

      return {
        ...state,
        [entityType]: arrayPut(id, state[entityType], index),
      };
    }

    if (action.type === actionTypes.MOVE) {
      const { entityType, src, dest } = action as MoveAction;

      if (!schema.typeExists(entityType)) {
        return state; // if no such entityType, then no change
      }

      return {
        ...state,
        [entityType]: arrayMove(state[entityType], src, dest),
      };
    }

    return state;
  }

  return rootReducer;
};
