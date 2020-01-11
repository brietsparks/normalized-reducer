import {
  ModelSchema,
  Namespaced,
  InvalidEntityHandler,
  InvalidRelHandler,
  State,
} from './types';

import { ModelSchemaReader } from './schema';
import { makeActions } from './actions';
import { makeSelectors } from './selectors';
import { makeReducer } from './reducer';
import { makeActionTransformer } from './middleware';
import {
  defaultNamespaced,
  defaultInvalidEntityHandler,
  defaultInvalidRelHandler,
} from './util';

export interface Options {
  namespaced?: Namespaced,
  onInvalidEntity?: InvalidEntityHandler,
  onInvalidRel?: InvalidRelHandler,
}

export * from './types';

export default function <S extends State> (
  schema: ModelSchema,
  options?: Options
) {
  const schemaReader = new ModelSchemaReader(schema);

  const opts = {
    namespaced: options?.namespaced || defaultNamespaced,
    onInvalidEntity: options?.onInvalidEntity || defaultInvalidEntityHandler,
    onInvalidRel: options?.onInvalidRel || defaultInvalidRelHandler,
  };

  const { types, creators } = makeActions(schemaReader, opts);
  const selectors = makeSelectors(schemaReader, creators, options);
  const transformAction = makeActionTransformer(schemaReader, types, selectors);
  const reducer = makeReducer(schemaReader, types, transformAction);
  const emptyState = schemaReader.getEmptyState<S>();

  return {
    reducer,
    selectors,
    actionTypes: types,
    actionCreators: creators,
    transformAction,
    emptyState,
  }
}
