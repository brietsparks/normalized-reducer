import {
  ModelSchema,
  Namespaced,
  InvalidEntityHandler,
  InvalidRelHandler,
} from './types';
import { ModelSchemaReader } from './schema';
import { makeActions } from './actions';
import { makeSelectors } from './selectors';
import { makeReducer } from './reducer';
import { makeActionTransformer } from './middleware';

export interface Options {
  namespaced: Namespaced,
  onInvalidEntity: InvalidEntityHandler,
  onInvalidRel: InvalidRelHandler,
}

export default function (schema: ModelSchema, options: Options) {
  const schemaReader = new ModelSchemaReader(schema);

  const { types, creators } = makeActions(schemaReader, options);
  const selectors = makeSelectors(schemaReader, creators, options);
  const transformAction = makeActionTransformer(schemaReader, types, selectors);
  const reducer = makeReducer(schemaReader, types, transformAction);

  return {
    reducer,
    selectors,
    actionTypes: types,
    actionCreators: creators,
    transformAction,
  }
}
