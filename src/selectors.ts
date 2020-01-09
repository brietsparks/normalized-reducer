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
  SelectorTreeSchema, ResourceTreeNode
} from './types';
import { ModelSchemaReader } from './schema';
import { noop } from './util';

export interface Opts {
  onInvalidEntity?: InvalidEntityHandler,
  onNonexistentResource?: NonexistentResourceHandler,
  onInvalidRel?: InvalidRelHandler,
  onInvalidRelData?: InvalidRelDataHandler
}

const emptyIds: string[] = [];
const emptyResources: ResourcesState = {};

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
  const getAllIds = (state: State) => {
    const allIds = state.ids;

    if (!allIds) {
      return schema.getEmptyIdsByEntityState();
    }

    return allIds;
  };
  const getAllResources = (state: State) => {
    const allResources = state.resources;

    if (!allResources) {
      return schema.getEmptyResourcesByEntityState();
    }

    return allResources;
  };

  const getIds = (state: State, args: { entity: string }) => {
    const idsByEntity = getAllIds(state);

    if (!schema.entityExists(args.entity)) {
      onInvalidEntity(args.entity);
      return emptyIds;
    }

    if (!idsByEntity) {
      return emptyIds;
    }

    return idsByEntity[args.entity];
  };

  const getResources = (state: State, args: { entity: string }) => {
    const resourcesByEntity = getAllResources(state);

    if (!schema.entityExists(args.entity)) {
      onInvalidEntity(args.entity);
      return emptyResources;
    }

    if (!resourcesByEntity) {
      return emptyResources;
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
    state: State,
    args: { entity: string, id: string, schema: SelectorTreeSchema }
  ): ResourceTreeNode[] => {
    const { entity, id, schema: selectorSchema } = args;

    if (!schema.entityExists(entity)) {
      return [];
    }

    const rootResource = getResource(state, { entity, id });

    if (!rootResource) {
      return [];
    }

    const nodes = recursivelyGetNodes(state, entity, id, selectorSchema);

    return Object.values(nodes);
  };

  const recursivelyGetNodes = (
    state: State,
    entity: string,
    id: string,
    selectorSchema: SelectorTreeSchema,
    nodes: Record<string, ResourceTreeNode> = {},
  ): Record<string, ResourceTreeNode> => {
    const resource = getResource(state, { entity, id });

    if (!resource) {
      return nodes;
    }

    nodes[`${entity}.${id}`] = { id, entity, resource };

    if (typeof selectorSchema === 'function') {
      selectorSchema = selectorSchema();
    }

    for (let [rel, nestedSelectorSchema] of Object.entries(selectorSchema)) {
      const relEntity = schema.entity(entity).getRelEntity(rel);

      if (relEntity) {
        const relIds = getAttachedArr(state, { entity, id, rel });
        for (let relId of relIds) {
          recursivelyGetNodes(state, relEntity, relId, nestedSelectorSchema, nodes);
        }
      }
    }

    return nodes;
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
