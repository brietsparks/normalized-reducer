import { ModelSchema, Namespaced, State } from './interfaces';
import { ModelSchemaReader } from './schema';
import { makeSelectors, getPublicSelectors } from './selectors';
import { makeActions } from './actions';
import Derivator from './derivator';
import { makeReducer } from './reducer';

const defaultNamespaced = (actionType: string) => `normalized/${actionType}`;

const makeModule = <T extends State>(schema: ModelSchema, namespaced: Namespaced = defaultNamespaced) => {
  const schemaReader = new ModelSchemaReader(schema);
  const { actionTypes, actionCreators, actionUtils } = makeActions(schemaReader, namespaced);
  const allSelectors = makeSelectors(schemaReader);
  const selectors = getPublicSelectors(allSelectors);
  const emptyState = schemaReader.getEmptyState<T>();
  const derivator = new Derivator(actionTypes, actionCreators, schemaReader, allSelectors);
  const reducer = makeReducer(schemaReader, derivator, actionTypes, actionUtils);

  return {
    emptyState,
    selectors,
    actionTypes,
    actionCreators,
    reducer,
  };
};

export * from './interfaces';

export default makeModule;
