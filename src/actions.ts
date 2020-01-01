import {
  Namespaced,
  AddAction,
  InvalidEntityHandler,
  AddPayloadOptions,
  AttachPayloadOptions, AddPayloadAttachable,
} from './types';

import { ModelSchemaReader } from './schema';

interface Opts {
  namespaced: Namespaced,
  onInvalidEntity: InvalidEntityHandler,
}

export const makeActions = (schema: ModelSchemaReader, opts: Opts) => {
  const { namespaced, onInvalidEntity } = opts;

  const ADD = namespaced('ADD');

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

    return {
      type: ADD,
      entity,
      id,
      attach,
      options,
    };
  };

  return {
    types: {
      ADD,
    },
    creators: {
      add,
    }
  }
};
