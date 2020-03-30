import {
  Namespaced,
  ActionTypes,
  ActionCreators,
  InvalidActionCreator,
  AttachActionCreator,
  AttachAction,
  DetachActionCreator,
  DetachAction,
  DeleteAction,
  DeleteActionCreator,
} from './interfaces';

import { ModelSchemaReader } from './schema';

import * as messages from './messages';

export interface ReturnObject {
  actionTypes: ActionTypes;
  actionCreators: ActionCreators;
}

export const makeActions = (schema: ModelSchemaReader, namespaced: Namespaced): ReturnObject => {
  const INVALID = namespaced('INVALID');
  const ATTACH = namespaced('ATTACH');
  const DETACH = namespaced('DETACH');
  const DELETE = namespaced('DELETE');

  const invalid: InvalidActionCreator = (action, error) => ({
    type: INVALID,
    error,
    action,
  });

  const attach: AttachActionCreator = (entityType, id, relation, relatedId, options) => {
    const action: AttachAction = {
      type: ATTACH,
      entityType,
      id,
      relation,
      relatedId,
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

  const detach: DetachActionCreator = (entityType, id, relation, relatedId) => {
    const action: DetachAction = {
      type: DETACH,
      entityType,
      id,
      relation,
      relatedId,
    };

    if (!schema.typeExists(entityType)) {
      return invalid(action, messages.entityTypeDne(entityType));
    }

    if (!schema.type(entityType).resolveRelationKey(relation)) {
      return invalid(action, messages.relDne(entityType, relation));
    }

    return action;
  };

  const del: DeleteActionCreator = (entityType, id) => {
    const action: DeleteAction = {
      type: DELETE,
      entityType,
      id,
    };

    if (!schema.typeExists(entityType)) {
      return invalid(action, messages.entityTypeDne(entityType));
    }

    return action;
  };

  return {
    actionTypes: {
      INVALID,
      ATTACH,
      DETACH,
      DELETE,
    },
    actionCreators: {
      attach,
      detach,
      delete: del,
    },
  };
};
