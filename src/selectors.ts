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
  SelectorTreeSchema
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
  const getAllIds = (state: State) => state.ids;
  const getAllResources = (state: State) => state.resources;

  const getIds = (state: State, args: { entity: string }) => {
    const idsByEntity = getAllIds(state);

    if (!schema.entityExists(args.entity)) {
      onInvalidEntity(args.entity);
      return [];
    }

    if (typeof idsByEntity !== 'object') {
      return [];
    }

    return idsByEntity[args.entity];
  };

  const getResources = (state: State, args: { entity: string }) => {
    const resourcesByEntity = getAllResources(state);

    if (!schema.entityExists(args.entity)) {
      onInvalidEntity(args.entity);
      return undefined;
    }

    if (typeof resourcesByEntity !== 'object') {
      return undefined;
    }

    return resourcesByEntity[args.entity];
  };

  const checkResource = (state: State, args: { entity: string, id: string }) => {
    const entityState = getResources(state, { entity: args.entity });

    if (!entityState) {
      return false;
    }

    return !!entityState[args.id];
  };

  const getResource = (state: State, args: { entity: string, id: string }) => {
    const entityState = getResources(state, { entity: args.entity });

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
    const resource = getResource(state, {
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

  const getAttachedArr = (state: State, args: { entity: string, id: string, rel: string }): string[] => {
    const relState = getAttached(state, args);

    if (relState === undefined) {
      return [];
    }

    if (schema.entity(args.entity).getCardinality(args.rel) === Cardinalities.MANY) {
      return relState as string[];
    }

    return relState ? [relState] as string[] : [] as string[];
  };

  const getAllAttachedArr = (state: State, args: { entity: string, id: string }) => {
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

  const getResourceTree = (
    state: State, args: {
      entity: string,
      id: string,
      schema: SelectorTreeSchema,
      tree?: { id: string, entity: string, resource: object }[]
    }): any => {
    const { entity, id } = args;

    if (!schema.entityExists(entity)) {
      return undefined;
    }

    const rootResource = getResource(state, { entity, id });

    if (!rootResource) {
      return undefined;
    }

    const rels = schema.entity(entity).getRels();


  };

  return {
    getAllIds,
    getAllResources,
    getIds,
    getResources,
    checkResource,
    getResource,
    getAttached,
    getAttachedArr,
    getAllAttachedArr,
    getResourceTree,
  }
};
