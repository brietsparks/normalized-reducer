import {
  Namespaced,
  AddAction,
  InvalidEntityHandler,
  AddPayloadOptions,
  AddPayloadAttachable,
  ActionTypes,
  ActionCreators,
  RemoveAction,
  InvalidRelHandler,
  AbstractState,
  AbstractResourceState,
  AbstractRelDataState,
  AbstractEntityState,
} from './types';

import { ModelSchemaReader } from './schema';

interface Opts {
  namespaced: Namespaced,
  onInvalidEntity: InvalidEntityHandler,
  onInvalidRel: InvalidRelHandler,
}

export const makeActions = <S extends AbstractState>(schema: ModelSchemaReader<S>, opts: Opts): { types: ActionTypes, creators: ActionCreators<S> } => {
  const { namespaced, onInvalidEntity, onInvalidRel } = opts;

  const ADD = namespaced('ADD');
  const REMOVE = namespaced('REMOVE');
  const ATTACH = namespaced('ATTACH');
  const DETACH = namespaced('DETACH');
  const MOVE_ATTACHED = namespaced('MOVE_ATTACHED');
  const SET_STATE = namespaced('SET_STATE');
  const SET_ENTITY_STATE = namespaced('SET_ENTITY_STATE');
  const SET_RESOURCE_STATE = namespaced('SET_RESOURCE_STATE');
  const SET_REL_STATE = namespaced('SET_REL_STATE');

  const entityExists = (entity: string) => schema.entityExists(entity);
  const relExists = (entity: string, rel: string) => schema.entity(entity)?.relExists(rel);

  const add = (
    entity: string,
    id: string,
    attach?: AddPayloadAttachable[],
    options?: AddPayloadOptions
  ): AddAction => {
    if (!entityExists(entity)) {
      onInvalidEntity(entity);
    }

    attach && attach.forEach(attachable => {
      if (!relExists(entity, attachable.rel)) {
        onInvalidRel(entity, attachable.rel);
      }
    });

    return {
      type: ADD,
      entity,
      id,
      attach,
      options,
    };
  };

  const remove = (
    entity: string,
    id: string,
  ): RemoveAction => {
    if (!entityExists(entity)) {
      onInvalidEntity(entity);
    }

    return {
      type: REMOVE,
      entity,
      id
    };
  };

  const attach = (
    entity: string,
    id: string,
    rel: string,
    relId: string,
    options: { index?: number, reciprocalIndex?: number } = {}
  ) => {
    if (!entityExists(entity)) {
      onInvalidEntity(entity);
    }

    if (!relExists(entity, rel)) {
      onInvalidRel(entity, rel);
    }

    return {
      type: ATTACH,
      entity,
      id,
      rel,
      relId,
      index: options.index,
      reciprocalIndex: options.reciprocalIndex,
    };
  };

  const detach = (
    entity: string,
    id: string,
    rel: string,
    relId: string,
  ) => {
    if (!entityExists(entity)) {
      onInvalidEntity(entity);
    }

    if (!relExists(entity, rel)) {
      onInvalidRel(entity, rel);
    }

    return {
      type: DETACH,
      entity,
      id,
      rel,
      relId,
    }
  };

  const moveAttached = (entity: string, id: string, rel: string, src: number, dest: number) => {
    if (!entityExists(entity)) {
      onInvalidEntity(entity);
    }

    if (!relExists(entity, rel)) {
      onInvalidRel(entity, rel);
    }

    return {
      type: MOVE_ATTACHED,
      entity,
      id,
      rel,
      src,
      dest
    };
  };

  const setState = (state: S) => ({ type: SET_STATE, state });

  const setEntityState = (entity: string, state: AbstractEntityState) => {
    if (!entityExists(entity)) {
      onInvalidEntity(entity);
    }

    return {
      type: SET_ENTITY_STATE,
      entity,
      state
    }
  };

  const setResourceState = (entity: string, id: string, state: AbstractResourceState) => {
    if (!entityExists(entity)) {
      onInvalidEntity(entity);
    }

    return {
      type: SET_RESOURCE_STATE,
      entity,
      id,
      state
    }
  };

  const setRelState = (entity: string, id: string, rel: string, state: AbstractRelDataState) => {
    if (!entityExists(entity)) {
      onInvalidEntity(entity);
    }

    if (!relExists(entity, rel)) {
      onInvalidRel(entity, rel);
    }

    return {
      type: SET_REL_STATE,
      entity,
      id,
      rel,
      state
    }
  };

  return {
    types: {
      ADD,
      REMOVE,
      ATTACH,
      DETACH,
      MOVE_ATTACHED,
      SET_STATE,
      SET_ENTITY_STATE,
      SET_RESOURCE_STATE,
      SET_REL_STATE,
    },
    creators: {
      add,
      remove,
      attach,
      detach,
      moveAttached,
      setState,
      setEntityState,
      setResourceState,
      setRelState,
    }
  }
};
