import { ModelSchemaReader } from './schema';
import {
  AbstractState,
  Action,
  ActionCreators,
  ActionTypes, AddAction, AttachAction,
  DeriveActionWithOps, DetachAction, Op,
  RemoveAction,
  Selectors
} from './types';
import { Batcher } from './batcher';
import { makeAddResourceOp } from './ops';

// makeActionTransformer is a selector that should be used to
// intercept an action before it gets handled by the entity reducer(s)
export const makeActionTransformer = <S extends AbstractState> (
  schema: ModelSchemaReader<S>,
  actionTypes: ActionTypes,
  selectors: Selectors<S>
): DeriveActionWithOps<S> => {
  return (state: S, action: Action): Action => {
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
        });
      }

      addAction.ops = pendingState.getAll();

      return addAction;
    }

    if (action.type === actionTypes.REMOVE) {
      const removeAction = action as RemoveAction;
      const { entity, id } = removeAction ;

      if (!selectors.checkResource(state, { entity, id })) {
        removeAction.ops = [];
        return removeAction;
      }

      pendingState.removeResource(entity, id);

      removeAction.ops = pendingState.getAll();

      return removeAction;
    }

    if (action.type === actionTypes.ATTACH) {
      const attachAction = action as AttachAction;
      const { entity, id, rel, relId, index, reciprocalIndex } = attachAction;

      pendingState.attachResources(entity, id, rel, relId, index, reciprocalIndex);

      attachAction.ops = pendingState.getAll();

      return attachAction;
    }

    if (action.type === actionTypes.DETACH) {
      const detachAction = action as DetachAction;
      const { entity, id, rel, relId } = detachAction;

      pendingState.detachResources(entity, id, rel, relId);

      detachAction.ops = pendingState.getAll();

      return detachAction;
    }

    return action;
  };
};
