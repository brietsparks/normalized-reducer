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
  defaultInvalidRelDataHandler,
  defaultNonExistentResourceHandler,
} from './util';

import { Options } from './types';

export * from './types';

export default function <S extends State> (
  schema: ModelSchema,
  options?: Partial<Options>
) {
  const schemaReader = new ModelSchemaReader(schema);

  const opts = {
    namespaced: options?.namespaced || defaultNamespaced,
    resolveRelFromEntity: options?.resolveRelFromEntity || false,
    onInvalidEntity: options?.onInvalidEntity || defaultInvalidEntityHandler,
    onInvalidRel: options?.onInvalidRel || defaultInvalidRelHandler,
    onInvalidRelData: options?.onInvalidRelData || defaultInvalidRelDataHandler,
    onNonexistentResource: options?.onNonexistentResource || defaultNonExistentResourceHandler,
  };

  const { types, creators } = makeActions(schemaReader, opts);
  const selectors = makeSelectors(schemaReader, creators, opts);
  const transformAction = makeActionTransformer(schemaReader, types, selectors, opts);
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
