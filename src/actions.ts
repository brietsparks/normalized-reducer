import {
  Id,
  State,
  Namespaced,
  InvalidActionCreator,
  AttachActionCreator,
  AttachAction,
  DetachActionCreator,
  DetachAction,
  DeleteAction,
  DeleteActionCreator,
  AnyAction,
  ActionTypes,
  SelectorTreeSchema,
  CreateActionCreator,
  CreateAction,
  UpdateActionCreator,
  UpdateAction,
  MoveAction,
  MoveActionCreator,
  MoveAttachedAction,
  MoveAttachedActionCreator,
  SortActionCreator,
  Entity,
  Compare,
  SortAttachedActionCreator,
  BatchActionCreator,
  SingularAction,
  SortAction,
  SetStateActionCreator,
  InvalidAction,
  SortAttachedAction,
} from './interfaces';
import { ModelSchemaReader } from './schema';
import * as messages from './messages';
import { UpdateActionMethod } from './enums';
import { cleanData } from './validator';

export const makeActions = <S extends State>(schema: ModelSchemaReader, namespaced: Namespaced) => {
  const BATCH = namespaced('BATCH');
  const INVALID = namespaced('INVALID');
  const ATTACH = namespaced('ATTACH');
  const DETACH = namespaced('DETACH');
  const DELETE = namespaced('DELETE');
  const CREATE = namespaced('CREATE');
  const UPDATE = namespaced('UPDATE');
  const MOVE = namespaced('MOVE');
  const MOVE_ATTACHED = namespaced('MOVE_ATTACHED');
  const SORT = namespaced('SORT');
  const SORT_ATTACHED = namespaced('SORT_ATTACHED');
  const SET_STATE = namespaced('SET_STATE');

  const invalid: InvalidActionCreator = (action, error) => ({
    type: INVALID,
    error,
    action,
  });

  const batch: BatchActionCreator = (...actions: (SingularAction | InvalidAction)[]) => ({
    type: BATCH,
    actions,
  });

  const attach: AttachActionCreator = (entityType, id, relation, attachableId, options = {}) => {
    const action: AttachAction = {
      type: ATTACH,
      entityType,
      id,
      relation,
      attachableId,
      index: options.index,
      reciprocalIndex: options.reciprocalIndex,
    };

    if (!schema.typeExists(entityType)) {
      return invalid(action, messages.entityTypeDne(entityType));
    }

    if (!schema.type(entityType).resolveRelationKey(relation)) {
      return invalid(action, messages.relDne(entityType, relation));
    }

    return action;
  };

  const detach: DetachActionCreator = (entityType, id, relation, detachableId) => {
    const action: DetachAction = {
      type: DETACH,
      entityType,
      id,
      relation,
      detachableId,
    };

    if (!schema.typeExists(entityType)) {
      return invalid(action, messages.entityTypeDne(entityType));
    }

    if (!schema.type(entityType).resolveRelationKey(relation)) {
      return invalid(action, messages.relDne(entityType, relation));
    }

    return action;
  };

  const del: DeleteActionCreator = (entityType, id, cascade?: SelectorTreeSchema) => {
    const action: DeleteAction = {
      type: DELETE,
      entityType,
      id,
      cascade,
    };

    if (!schema.typeExists(entityType)) {
      return invalid(action, messages.entityTypeDne(entityType));
    }

    return action;
  };

  const create: CreateActionCreator = (entityType, id, data = {}, index?) => {
    const action: CreateAction = {
      type: CREATE,
      entityType,
      id,
      data,
      index,
    };

    if (!schema.typeExists(entityType)) {
      return invalid(action, messages.entityTypeDne(entityType));
    }

    // data must be an object with only non-relational attributes
    action.data = cleanData(data, schema, entityType);

    return action;
  };

  const update: UpdateActionCreator = (entityType, id, data, options = {}) => {
    const action: UpdateAction = {
      type: UPDATE,
      entityType,
      id,
      data,
      method: options.method || UpdateActionMethod.PATCH,
    };

    if (!schema.typeExists(entityType)) {
      return invalid(action, messages.entityTypeDne(entityType));
    }

    // data must be an object with only non-relational attributes
    action.data = cleanData(data, schema, entityType);

    return action;
  };

  const move: MoveActionCreator = (entityType, src, dest) => {
    const action: MoveAction = {
      type: MOVE,
      entityType,
      src,
      dest,
    };

    if (!schema.typeExists(entityType)) {
      return invalid(action, messages.entityTypeDne(entityType));
    }

    if (src < 0) {
      return invalid(action, messages.indexLtZero('source'));
    }

    if (dest < 0) {
      return invalid(action, messages.indexLtZero('destination'));
    }

    return action;
  };

  const moveAttached: MoveAttachedActionCreator = (entityType, id, relation, src, dest) => {
    const action: MoveAttachedAction = {
      type: MOVE_ATTACHED,
      entityType,
      id,
      relation,
      src,
      dest,
    };

    if (!schema.typeExists(entityType)) {
      return invalid(action, messages.entityTypeDne(entityType));
    }

    if (!schema.type(entityType).resolveRelationKey(relation)) {
      return invalid(action, messages.relDne(entityType, relation));
    }

    if (src < 0) {
      return invalid(action, messages.indexLtZero('source'));
    }

    if (dest < 0) {
      return invalid(action, messages.indexLtZero('destination'));
    }

    return action;
  };

  const sort: SortActionCreator = <T extends Entity = Entity>(entityType: string, compare: Compare<T>) => {
    const action = {
      type: SORT,
      entityType,
      compare,
    } as SortAction;

    if (!schema.typeExists(entityType)) {
      return invalid(action as SortAction, messages.entityTypeDne(entityType));
    }

    return action;
  };

  const sortAttached: SortAttachedActionCreator = <T extends Entity = Entity>(
    entityType: string,
    id: Id,
    relation: string,
    compare: Compare<T>
  ) => {
    const action = {
      type: SORT_ATTACHED,
      entityType,
      id,
      relation,
      compare,
    } as SortAttachedAction;

    if (!schema.typeExists(entityType)) {
      return invalid(action, messages.entityTypeDne(entityType));
    }

    if (!schema.type(entityType).resolveRelationKey(relation)) {
      return invalid(action, messages.relDne(entityType, relation));
    }

    return action;
  };

  const setState: SetStateActionCreator<S> = (state: S) => {
    return {
      type: SET_STATE,
      state,
    };
  };

  const actionTypes = {
    BATCH,
    INVALID,
    ATTACH,
    DETACH,
    DELETE,
    CREATE,
    UPDATE,
    MOVE,
    MOVE_ATTACHED,
    SORT,
    SORT_ATTACHED,
    SET_STATE,
  };

  const actionCreators = {
    batch,
    attach,
    detach,
    delete: del,
    create,
    update,
    move,
    moveAttached,
    sort,
    sortAttached,
    setState,
  };

  const actionUtils = new ActionUtils(actionTypes);

  return {
    actionTypes,
    actionCreators,
    actionUtils,
  };
};

export class ActionUtils {
  actionTypes: ActionTypes;

  constructor(actionTypes: ActionTypes) {
    this.actionTypes = actionTypes;
  }

  isHandleable(action: AnyAction) {
    return Object.values(this.actionTypes).includes(action.type);
  }

  isDerivable(action: AnyAction) {
    const { DETACH, DELETE, ATTACH } = this.actionTypes;
    return [DETACH, DELETE, ATTACH].includes(action.type);
  }

  isBatch(action: AnyAction) {
    return action.type === this.actionTypes.BATCH;
  }

  isStateSetter(action: AnyAction) {
    return action.type === this.actionTypes.SET_STATE;
  }
}
