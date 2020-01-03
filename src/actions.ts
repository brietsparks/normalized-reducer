import {
  Namespaced,
  AddAction,
  InvalidEntityHandler,
  AddPayloadOptions,
  AttachPayloadOptions,
  AddPayloadAttachable,
  ActionTypes,
  ActionCreators,
  RemoveAction,
  InvalidRelHandler, AbstractState,
} from './types';

import { ModelSchemaReader } from './schema';

interface Opts {
  namespaced: Namespaced,
  onInvalidEntity: InvalidEntityHandler,
  onInvalidRel: InvalidRelHandler,
}

export const makeActions = <S extends AbstractState>(schema: ModelSchemaReader<S>, opts: Opts): { types: ActionTypes, creators: ActionCreators } => {
  const { namespaced, onInvalidEntity, onInvalidRel } = opts;

  const ADD = namespaced('ADD');
  const REMOVE = namespaced('REMOVE');
  const ATTACH = namespaced('ATTACH');
  const DETACH = namespaced('DETACH');

  const entityExists = (entity: string) => schema.entityExists(entity);
  const relExists = (entity: string, rel: string) => schema.entity(entity).relExists(rel);

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
    options?: AttachPayloadOptions
  ) => {
    if (!entityExists(entity)) {
      onInvalidEntity(entity);
    }

    if (!relExists(entity, rel)) {
      onInvalidEntity(entity);
    }

    return {
      type: ATTACH,
      entity,
      id,
      rel,
      relId,
      options,
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
      onInvalidEntity(entity);
    }

    return {
      type: DETACH,
      entity,
      id,
      rel,
      relId,
    }
  };

  return {
    types: {
      ADD,
      REMOVE,
      ATTACH,
      DETACH,
    },
    creators: {
      add,
      remove,
      attach,
      detach,
    }
  }
};
