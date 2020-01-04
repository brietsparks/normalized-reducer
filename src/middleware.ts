import { ModelSchemaReader } from './schema';
import {
  AbstractState,
  OpAction,
  ActionCreators,
  ActionTypes, AddAction, AttachAction,
  DeriveActionWithOps, DetachAction, MoveAttachedAction, Op,
  RemoveAction,
  Selectors, BatchAction, Action
} from './types';
import { Batcher } from './batcher';
import { makeAddResourceOp, makeMoveAttachedOp } from './ops';

// makeActionTransformer is a selector that should be used to
// intercept an action before it gets handled by the entity reducer(s)
export const makeActionTransformer = <S extends AbstractState> (
  schema: ModelSchemaReader<S>,
  actionTypes: ActionTypes,
  selectors: Selectors<S>
): DeriveActionWithOps<S> => {
  const transformAction = (state: S, action: Action, batcher?: Batcher<S>): OpAction => {
    const pendingState = batcher || new Batcher<S>(schema, state, selectors);

    if (action.type === actionTypes.BATCH) {
      const batchAction = action as BatchAction;

      batchAction.ops = batchAction.actions.reduce((ops, action) => {
        const transformedAction = transformAction(state, action, batcher);

        if (transformedAction.ops) {
          ops.push(...transformedAction.ops);
        }

        return ops;
      }, [] as Op[]);

      return batchAction;
    }

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

    if (action.type === actionTypes.MOVE_ATTACHED) {
      const moveAttachedAction = action as MoveAttachedAction;
      const { entity, id, rel, src, dest } = moveAttachedAction;

      moveAttachedAction.ops = [makeMoveAttachedOp(entity, id, rel, src, dest)];

      return moveAttachedAction;
    }

    return action;
  };

  return transformAction;
};
