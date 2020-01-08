import {
  ModelSchema,
  Namespaced,
  InvalidEntityHandler,
  InvalidRelHandler, EntitiesState,
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
  namespaced: Namespaced,
  onInvalidEntity: InvalidEntityHandler,
  onInvalidRel: InvalidRelHandler,
}

export * from './types';

export default function (
  schema: ModelSchema,
  options: Options = {
    namespaced: defaultNamespaced,
    onInvalidEntity: defaultInvalidEntityHandler,
    onInvalidRel: defaultInvalidRelHandler,
  }) {
  const schemaReader = new ModelSchemaReader(schema);

  const { types, creators } = makeActions(schemaReader, options);
  const selectors = makeSelectors(schemaReader, creators, options);
  const transformAction = makeActionTransformer(schemaReader, types, selectors);
  const reducer = makeReducer(schemaReader, types, transformAction);
  const emptyState = schemaReader.getEmptyState();

  return {
    reducer,
    selectors,
    actionTypes: types,
    actionCreators: creators,
    transformAction,
    emptyState,
  }
}
