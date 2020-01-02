import {
  Cardinalities,
  AbstractState,
  InvalidEntityHandler,
  InvalidRelHandler,
  InvalidRelDataHandler,
  NonexistentResourceHandler,
  ActionCreators,
  ActionTypes,
  Selectors,
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
  const getEntityState = <S extends AbstractState>(state: S, args: { entity: string }) => {
    if (!schema.entityExists(args.entity)) {
      onInvalidEntity(args.entity);
      return undefined;
    }

    return state[args.entity];
  };

  const checkResource = <S extends AbstractState>(state: S, args: { entity: string, id: string }) => {
    const entityState = getEntityState(state, { entity: args.entity });

    if (!entityState) {
      return false;
    }

    return !!entityState[args.id];
  };

  const getResourceState = <S extends AbstractState>(state: S, args: { entity: string, id: string }) => {
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

  const getAttached = <S extends AbstractState>(state: S, args: { entity: string, id: string, rel: string }) => {
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

  const getAttachedArr = <S extends AbstractState>(
    state: S,
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

  return {
    checkResource: checkResource,
    getAttached,
    getAttachedArr,
  }
};
