import {
  Id,
  State,
  IdsByType,
  EntitiesByType,
  ActionTypes,
  AnyAction,
  Action,
  BatchAction,
  SingularAction,
  DetachAction,
  Entity,
  DerivedAction,
} from './interfaces';
import { ModelSchemaReader } from './schema';
import Derivator from './derivator';
import { ActionUtils } from './actions';
import { Cardinalities } from './enums';

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

      const cardinality = schema.type(entityType).resolveRelationCardinality(relation);

      let newEntity = entity; // to be immutably overwritten

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

    return state;
  }

  const defaultIdsState = schema.getEmptyIdsByTypeState();
  function idsReducer(state: IdsByType = defaultIdsState, action: SingularAction): IdsByType {
    if (action.type === actionTypes.INVALID) {
      return state;
    }

    return state;
  }

  return rootReducer;
};
