import {
  Cardinalities,
  ResourcesByEntityState,
  InvalidEntityHandler,
  InvalidRelHandler,
  InvalidRelDataHandler,
  NonexistentResourceHandler,
  ActionCreators,
  ActionTypes,
  Selectors, ResourcesState, State,
} from './types';
import { ModelSchemaReader } from './schema';
import { noop } from './util';

export interface Opts {
  onInvalidEntity?: InvalidEntityHandler,
  onNonexistentResource?: NonexistentResourceHandler,
  onInvalidRel?: InvalidRelHandler,
  onInvalidRelData?: InvalidRelDataHandler
}

export const makeSelectors = (
  schema: ModelSchemaReader,
  actionCreators: ActionCreators,
  {
    onInvalidEntity = noop,
    onNonexistentResource = noop,
    onInvalidRel = noop,
    onInvalidRelData = noop
  }: Opts = {}
): Selectors => {
  const getEntitiesState = (state: State) => state.resources;
  const getIdsState = (state: State) => state.ids;

  const getEntityState = (state: State, args: { entity: string }) => {
    const entityState = getEntitiesState(state);

    if (typeof entityState !== 'object') {
      return undefined;
    }

    if (!schema.entityExists(args.entity)) {
      onInvalidEntity(args.entity);
      return undefined;
    }

    return entityState[args.entity];
  };

  const checkResource = (state: State, args: { entity: string, id: string }) => {
    const entityState = getEntityState(state, { entity: args.entity });

    if (!entityState) {
      return false;
    }

    return !!entityState[args.id];
  };

  const getResourceState = (state: State, args: { entity: string, id: string }) => {
    const entityState = getEntityState(state, { entity: args.entity });

    if (!entityState) {
      return undefined;
    }

    const resource = entityState[args.id];

    if (!resource) {
      onNonexistentResource(args.entity, args.id);
      return undefined;
    }

    return resource;
  };

  const getAttached = (state: State, args: { entity: string, id: string, rel: string }) => {
    const resource = getResourceState(state, {
      entity: args.entity,
      id: args.id,
    });

    const entitySchema = schema.entity(args.entity);
    if (!entitySchema.relExists(args.rel)) {
      onInvalidRel(args.entity, args.rel);
      return undefined;
    }

    if (!resource) {
      return undefined;
    }

    const relState = resource[args.rel];

    if (!entitySchema.relDataIsValid(args.rel, relState)) {
      onInvalidRelData(args.entity, args.rel, relState);
      return undefined;
    }

    return relState;
  };

  const getAttachedArr = (
    state: State,
    args: {
      entity: string,
      id: string,
      rel: string,
    },
  ): string[] => {
    const relState = getAttached(state, args);

    if (schema.entity(args.entity).getCardinality(args.rel) === Cardinalities.MANY) {
      return relState as string[];
    }

    return relState ? [relState] as string[] : [] as string[];
  };

  const getEntityAttachedArr = (state: State, args: { entity: string, id: string }) => {
    const result: { [rel: string]: string[] } = {};

    if (!schema.entityExists(args.entity)) {
      onInvalidEntity(args.entity);
      return result;
    }

    const rels = schema.entity(args.entity).getRels();

    return rels.reduce((attachedArrs, rel) => {
      attachedArrs[rel] = getAttachedArr(state, { rel, ...args });
      return attachedArrs;
    }, result);
  };

  return {
    checkResource,
    getAttached,
    getAttachedArr,
    getEntityAttachedArr,
  }
};
