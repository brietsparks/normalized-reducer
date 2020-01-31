import {
  AddAction,
  AddAttachable,
  ActionTypes,
  ActionCreators,
  RemoveAction,
  Resource,
  Resources,
  ConcreteOpAction,
  SelectorTreeSchema,
  Options,
  State,
  IdsByEntity,
  ResourcesByEntity,
} from './types';

import { ModelSchemaReader } from './schema';

import { cleanData } from './validator';

export const makeActions = (
  schema: ModelSchemaReader,
  opts: Options
): { types: ActionTypes; creators: ActionCreators } => {
  const {
    namespaced,
    resolveRelFromEntity,
    onInvalidEntity,
    onInvalidRel,
  } = opts;

  const ADD = namespaced('ADD');
  const REMOVE = namespaced('REMOVE');
  const EDIT = namespaced('EDIT');
  const MOVE = namespaced('MOVE');
  const ATTACH = namespaced('ATTACH');
  const DETACH = namespaced('DETACH');
  const MOVE_ATTACHED = namespaced('MOVE_ATTACHED');
  const BATCH = namespaced('BATCH');

  const SET_STATE = namespaced('SET_STATE');
  const SET_ALL_IDS = namespaced('SET_ALL_IDS');
  const SET_ALL_RESOURCES = namespaced('SET_ALL_RESOURCES');
  const SET_IDS = namespaced('SET_IDS');
  const SET_RESOURCES = namespaced('SET_RESOURCES');
  const SET_RESOURCE = namespaced('SET_RESOURCE');

  const entityExists = (entity: string) => schema.entityExists(entity);
  const relIsValid = (entity: string, rel: string) =>
    schema.entity(entity)?.relIsValid(rel, resolveRelFromEntity);

  const add = (
    entity: string,
    id: string,
    data?: { [key: string]: any },
    attach?: AddAttachable[],
    index?: number
  ): AddAction => {
    if (!entityExists(entity)) {
      onInvalidEntity(entity);
    }

    attach &&
      attach.forEach(attachable => {
        if (!relIsValid(entity, attachable.rel)) {
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
    removalSchema?: SelectorTreeSchema
  ): RemoveAction => {
    if (!entityExists(entity)) {
      onInvalidEntity(entity);
    }

    return {
      type: REMOVE,
      entity,
      id,
      removalSchema,
    };
  };

  const edit = (entity: string, id: string, data: { [key: string]: any }) => {
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

  const move = (entity: string, src: number, dest: number) => {
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
    options: { index?: number; reciprocalIndex?: number } = {}
  ) => {
    if (!entityExists(entity)) {
      onInvalidEntity(entity);
    }

    if (!relIsValid(entity, rel)) {
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

  const detach = (entity: string, id: string, rel: string, relId: string) => {
    if (!entityExists(entity)) {
      onInvalidEntity(entity);
    }

    if (!relIsValid(entity, rel)) {
      onInvalidRel(entity, rel);
    }

    return {
      type: DETACH,
      entity,
      id,
      rel,
      relId,
    };
  };

  const moveAttached = (
    entity: string,
    id: string,
    rel: string,
    src: number,
    dest: number
  ) => {
    if (!entityExists(entity)) {
      onInvalidEntity(entity);
    }

    if (!relIsValid(entity, rel)) {
      onInvalidRel(entity, rel);
    }

    return {
      type: MOVE_ATTACHED,
      entity,
      id,
      rel,
      src,
      dest,
    };
  };

  const batch = (...actions: ConcreteOpAction[]) => {
    return {
      type: BATCH,
      actions,
    };
  };

  const setState = (state: State) => ({ type: SET_STATE, state });

  const setAllIds = (state: IdsByEntity) => ({ type: SET_ALL_IDS, state });

  const setAllResources = (state: ResourcesByEntity) => ({
    type: SET_ALL_RESOURCES,
    state,
  });

  const setIds = (entity: string, state: string[]) => {
    if (!entityExists(entity)) {
      onInvalidEntity(entity);
    }

    return {
      type: SET_IDS,
      entity,
      state,
    };
  };

  const setResources = (entity: string, state: Resources) => {
    if (!entityExists(entity)) {
      onInvalidEntity(entity);
    }

    return {
      type: SET_RESOURCES,
      entity,
      state,
    };
  };

  const setResource = (entity: string, id: string, state: Resource) => {
    if (!entityExists(entity)) {
      onInvalidEntity(entity);
    }

    return {
      type: SET_RESOURCE,
      entity,
      id,
      state,
    };
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
      SET_ALL_IDS,
      SET_ALL_RESOURCES,
      SET_IDS,
      SET_RESOURCES,
      SET_RESOURCE,
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
      setAllIds,
      setAllResources,
      setIds,
      setResources,
      setResource,
    },
  };
};
