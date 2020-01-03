import { ModelSchemaReader } from './schema';
import {
  AbstractState,
  Action,
  ActionCreators,
  ActionTypes, AddAction,
  DeriveActionWithOps, Op,
  RemoveAction,
  Selectors
} from './types';
import { Batcher } from './batcher';
import { makeAddResourceOp } from './ops';

// makeActionTransformer is a selector that should be used to
// intercept an action before it gets handled by the entity reducer(s)
export const makeActionTransformer = (
  schema: ModelSchemaReader,
  actionTypes: ActionTypes,
  selectors: Selectors
): DeriveActionWithOps => {
  return <S extends AbstractState>(state: S, action: Action): Action => {
    const pendingState = new Batcher<S>(schema, state, selectors);

    const entitySchema = schema.entity(action.entity);

    if (action.type === actionTypes.ADD) {
      const addAction = action as AddAction;
      const { entity, id } = addAction;

      if (selectors.checkResource(state, { entity, id })) {
        addAction.ops = [];
        return addAction;
      }

      pendingState.addResource(entity, id);

      if (addAction.attach) {
        addAction.attach.forEach(attachable => {
          pendingState.attachResources(
            entity,
            id,
            attachable.rel,
            attachable.id,
            attachable.index,
            attachable.reciprocalIndex,
          )
        })
      }

      addAction.ops = pendingState.getAll();

      return addAction;
    }

    if (action.type === actionTypes.REMOVE) {
      const removeAction = action as RemoveAction;
    }

    return action;
  };
};
