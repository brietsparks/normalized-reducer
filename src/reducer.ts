import {
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
  InvalidAction,
  MoveAction,
  MoveAttachedAction,
  SetStateAction,
  SingularAction,
  SortAction,
  SortAttachedAction,
  State,
  UpdateAction,
  Reducer,
} from './interfaces';
import { ModelSchemaReader } from './schema';
import Derivator from './derivator';
import { ActionUtils } from './actions';
import { Cardinalities, UpdateActionMethod } from './enums';
import { arrayMove, arrayPut } from './util';

export const makeReducer = <S extends State>(
  schema: ModelSchemaReader,
  derivator: Derivator<S>,
  actionTypes: ActionTypes,
  actionUtils: ActionUtils
) => {
  const rootReducer: Reducer<S> = (state: S = schema.getEmptyState(), action: AnyAction): S => {
    // if not handleable, then return state without changes
    if (!actionUtils.isHandleable(action)) {
      return state;
    }

    if (actionUtils.isStateSetter(action)) {
      if (action.type === actionTypes.SET_STATE) {
        return (action as SetStateAction<S>).state;
      }
    }

    if (actionUtils.isBatch(action)) {
      // with a batch action, reduce iteratively
      const batchAction = action as BatchAction;
      return batchAction.actions.reduce((prevState: S, action: SingularAction | InvalidAction) => {
        return singularReducer(prevState, action);
      }, state);
    } else {
      // with a singular action, reduce once
      return singularReducer(state, action as SingularAction);
    }
  };

  function singularReducer(state: S, action: SingularAction | InvalidAction): S {
    const singularAction = action as SingularAction;

    let actions: SingularAction[];
    if (actionUtils.isDerivable(singularAction)) {
      const derivedAction = derivator.deriveAction(state, singularAction) as DerivedAction;
      actions = derivedAction.derived;
    } else {
      actions = [singularAction];
    }

    // reduce [action]
    return actions.reduce((prevState: S, action: SingularAction) => {
      // sort has to be handled here because it needs both slices
      if (action.type === actionTypes.SORT) {
        const { entityType, compare } = action as SortAction;

        const ids = prevState.ids[entityType];
        const entities = prevState.entities[entityType];
        const sortedIds = [...ids].sort((idA, idB) => {
          const entityA = entities[idA];
          const entityB = entities[idB];

          // comparison error will need to be handled in the future
          // ...

          return compare(entityA, entityB);
        });

        return {
          entities: prevState.entities,
          ids: {
            ...prevState.ids,
            [entityType]: sortedIds,
          },
        } as S;
      }

      // all other actions handled here
      return {
        entities: entitiesReducer(prevState.entities, action),
        ids: idsReducer(prevState.ids, action),
      } as S;
    }, state);
  }

  const defaultEntitiesState = schema.getEmptyEntitiesByTypeState();
  function entitiesReducer(
    state: EntitiesByType = defaultEntitiesState,
    action: SingularAction
  ): EntitiesByType {
    if (action.type === actionTypes.INVALID) {
      return state;
    }

    if (!schema.typeExists(action.entityType)) {
      return state; // if no such entityType, then no change
    }

    if (action.type === actionTypes.DETACH) {
      const { entityType, id, detachableId, relation } = action as DetachAction;

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

      const entity = state[entityType][id] as Entity;
      if (!entity) {
        return state; // if entity not found, then no change
      }

      let newEntity = { ...entity };

      if (method === UpdateActionMethod.PUT) {
        // extract the current relational data, so we have a copy of it and it won't get overwritten
        const relationKeys = schema.type(entityType).getRelationKeys();
        const relationalData = relationKeys.reduce((relationalData, relationKey) => {
          if (entity[relationKey]) {
            relationalData[relationKey] = entity[relationKey];
          }
          return relationalData;
        }, {} as { [k: string]: Id | Id[] });

        // replace the current entity with the update data and the relational data
        newEntity = { ...data, ...relationalData };
      }

      if (method === UpdateActionMethod.PATCH) {
        // merge the update data with the current data
        newEntity = { ...entity, ...data };
      }

      return {
        ...state,
        [entityType]: {
          ...state[entityType],
          [id]: newEntity,
        },
      };
    }

    if (action.type === actionTypes.MOVE_ATTACHED) {
      const { entityType, id, relation, src, dest } = action as MoveAttachedAction;

      const entity = state[entityType][id] as Entity;
      if (!entity) {
        return state; // if entity not found, then no change
      }

      const relationKey = schema.type(entityType).resolveRelationKey(relation);
      if (!relationKey) {
        return state; // if entity relation key not found, then no change
      }

      const cardinality = schema.type(entityType).resolveRelationCardinality(relation);
      if (cardinality === Cardinalities.ONE) {
        return state; // if cardinality is one, then no change
      }

      const attachedIds = entity[relationKey];
      if (!Array.isArray(attachedIds)) {
        return state; // if attached ids is not an array, then no change
      }

      const newEntity = {
        ...entity,
        [relationKey]: arrayMove(attachedIds, src, dest),
      };

      return {
        ...state,
        [entityType]: {
          ...state[entityType],
          [id]: newEntity,
        },
      };
    }

    if (action.type === actionTypes.SORT_ATTACHED) {
      const { entityType, id, relation, compare } = action as SortAttachedAction;

      const entity = state[entityType][id] as Entity;
      if (!entity) {
        return state; // if entity not found, then no change
      }

      const relationKey = schema.type(entityType).resolveRelationKey(relation);
      const relationType = schema.type(entityType).resolveRelationType(relation);
      if (!relationKey || !relationType) {
        return state; // if entity relation key or relation type not found, then no change
      }

      const cardinality = schema.type(entityType).resolveRelationCardinality(relation);
      if (cardinality === Cardinalities.ONE) {
        return state; // if cardinality is one, then no change
      }

      const attachedIds = entity[relationKey];
      if (!Array.isArray(attachedIds)) {
        return state; // if attached ids is not an array, then no change
      }

      const relatedEntities = state[relationType];
      const sortedIds = [...attachedIds].sort((idA, idB) => {
        const entityA = relatedEntities[idA];
        const entityB = relatedEntities[idB];

        // comparison error will need to be handled in the future
        // ...

        return compare(entityA, entityB);
      });

      const newEntity = {
        ...entity,
        [relationKey]: sortedIds,
      };

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

    if (!schema.typeExists(action.entityType)) {
      return state; // if no such entityType, then no change
    }

    if (action.type === actionTypes.DELETE) {
      const { entityType, id } = action as DeleteAction;

      const idsOfEntity = state[entityType].filter(existingId => existingId !== id);

      return {
        ...state,
        [entityType]: idsOfEntity,
      };
    }

    if (action.type === actionTypes.CREATE) {
      const { entityType, id, index } = action as CreateAction;

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

      return {
        ...state,
        [entityType]: arrayMove(state[entityType], src, dest),
      };
    }

    return state;
  }

  return rootReducer;
};
