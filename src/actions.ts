import {
  Namespaced,
  AddAction,
  InvalidEntityHandler,
  AddAttachable,
  ActionTypes,
  ActionCreators,
  RemoveAction,
  InvalidRelHandler,
  ResourcesByEntityState,
  ResourceState,
  RelDataState,
  ResourcesState, ConcreteOpAction, EditAction,
} from './types';

import { ModelSchemaReader } from './schema';

import { cleanData } from './validator';

interface Opts {
  namespaced: Namespaced,
  onInvalidEntity: InvalidEntityHandler,
  onInvalidRel: InvalidRelHandler,
}

export const makeActions = (schema: ModelSchemaReader, opts: Opts): { types: ActionTypes, creators: ActionCreators } => {
  const { namespaced, onInvalidEntity, onInvalidRel } = opts;

  const ADD = namespaced('ADD');
  const REMOVE = namespaced('REMOVE');
  const EDIT = namespaced('EDIT');
  const MOVE = namespaced('MOVE');
  const ATTACH = namespaced('ATTACH');
  const DETACH = namespaced('DETACH');
  const MOVE_ATTACHED = namespaced('MOVE_ATTACHED');
  const BATCH = namespaced('BATCH');

  const SET_STATE = namespaced('SET_STATE');
  const SET_ENTITY_STATE = namespaced('SET_ENTITY_STATE');
  const SET_RESOURCE_STATE = namespaced('SET_RESOURCE_STATE');
  const SET_REL_STATE = namespaced('SET_REL_STATE');

  const entityExists = (entity: string) => schema.entityExists(entity);
  const relExists = (entity: string, rel: string) => schema.entity(entity)?.relExists(rel);

  const add = (
    entity: string,
    id: string,
    data?: { [key: string]: any },
    attach?: AddAttachable[],
    index?: number,
  ): AddAction => {
    if (!entityExists(entity)) {
      onInvalidEntity(entity);
    }

    attach && attach.forEach(attachable => {
      if (!relExists(entity, attachable.rel)) {
        onInvalidRel(entity, attachable.rel);
      }
    });

    const cleanedData = cleanData(data, schema, entity);

    return {
      type: ADD,
      entity,
      id,
      data: cleanedData,
      attach,
      index,
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

  const edit = (
    entity: string,
    id: string,
    data: { [key: string]: any },
  ) => {
    if (!entityExists(entity)) {
      onInvalidEntity(entity);
    }

    const cleanedData = cleanData(data, schema, entity);

    return {
      type: EDIT,
      entity,
      id,
      data: cleanedData,
    };
  };

  const move = (
    entity: string,
    src: number,
    dest: number
  ) => {
    if (!entityExists(entity)) {
      onInvalidEntity(entity);
    }

    return {
      type: MOVE,
      entity,
      src,
      dest,
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

  const batch = (...actions: ConcreteOpAction[]) => {
    return {
      type: BATCH,
      actions
    };
  };

  const setState = (state: ResourcesState) => ({ type: SET_STATE, state });

  const setEntityState = (entity: string, state: ResourcesState) => {
    if (!entityExists(entity)) {
      onInvalidEntity(entity);
    }

    return {
      type: SET_ENTITY_STATE,
      entity,
      state
    }
  };

  const setResourceState = (entity: string, id: string, state: ResourceState) => {
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

  const setRelState = (entity: string, id: string, rel: string, state: RelDataState) => {
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
      EDIT,
      MOVE,
      ATTACH,
      DETACH,
      MOVE_ATTACHED,
      BATCH,
      SET_STATE,
      SET_ENTITY_STATE,
      SET_RESOURCE_STATE,
      SET_REL_STATE,
    },
    creators: {
      add,
      remove,
      edit,
      move,
      attach,
      detach,
      moveAttached,
      batch,
      setState,
      setEntityState,
      setResourceState,
      setRelState,
    }
  }
};
