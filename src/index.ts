import { Schema, Namespaced, State } from './interfaces';
import { ModelSchemaReader } from './schema';
import { makeSelectors, getPublicSelectors } from './selectors';
import { makeActions } from './actions';
import Derivator from './derivator';
import { makeReducer } from './reducer';

const defaultNamespaced = (actionType: string) => `normalized/${actionType}`;

const makeNormalizedSlice = <S extends State>(schema: Schema, namespaced: Namespaced = defaultNamespaced) => {
  const schemaReader = new ModelSchemaReader(schema);
  const { actionTypes, actionCreators, actionUtils } = makeActions<S>(schemaReader, namespaced);
  const allSelectors = makeSelectors<S>(schemaReader);
  const selectors = getPublicSelectors<S>(allSelectors);
  const emptyState = schemaReader.getEmptyState<S>();
  const derivator = new Derivator<S>(actionTypes, actionCreators, schemaReader, allSelectors);
  const reducer = makeReducer<S>(schemaReader, derivator, actionTypes, actionUtils);

  return {
    emptyState,
    selectors,
    actionTypes,
    actionCreators,
    reducer,
  };
};

export * from './interfaces';
export * from './enums';
export * from './normalizr';

export default makeNormalizedSlice;
