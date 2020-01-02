import { ModelSchemaReader } from './schema';
import {
  AbstractState,
  Action,
  ActionCreators,
  ActionTypes,
  DeriveActionWithOps,
  RemoveAction,
  Selectors
} from './types';
import { Batcher } from './batcher';

// makeActionTransformer is a selector that should be used to
// intercept an action before it gets handled by the entity reducer(s)
export const makeActionTransformer = (
  schema: ModelSchemaReader,
  actionCreators: ActionCreators,
  actionTypes: ActionTypes,
  selectors: Selectors
): DeriveActionWithOps => {
  return <S extends AbstractState>(state: S, action: Action): Action => {
    const pendingState = new Batcher<S>(schema, state, selectors);

    const entitySchema = schema.entity(action.entity);

    if (action.type === actionTypes.ADD) {
      return action;
    }

    if (action.type === actionTypes.REMOVE) {
      const removeAction = action as RemoveAction;
    }

    return action;
  };
};
