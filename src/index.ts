import { ModelSchema, Namespaced, State } from './interfaces';
import { ModelSchemaReader } from './schema';
import { makeSelectors } from './selectors';
import { makeActions } from './actions';
import Derivator from './derivator';

const defaultNamespaced = (actionType: string) => `normalized/${actionType}`;

const makeModule = <T extends State>(schema: ModelSchema, namespaced: Namespaced = defaultNamespaced) => {
  const schemaReader = new ModelSchemaReader(schema);
  const { actionTypes, actionCreators } = makeActions(schemaReader, namespaced);
  const selectors = makeSelectors(schemaReader);
  const emptyState = schemaReader.getEmptyState<T>();

  // @ts-ignore
  const derivator = new Derivator(actionTypes, actionCreators, schemaReader, selectors);

  return {
    emptyState,
    selectors,
    actionTypes,
    actionCreators,
  };
};

export * from './interfaces';

export default makeModule;
