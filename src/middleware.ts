import { ModelSchemaReader } from './schema';
import {
  OpAction,
  ActionTypes, AddAction, AttachAction,
  DeriveActionWithOps, DetachAction, MoveAttachedAction, Op,
  RemoveAction,
  Selectors, BatchAction, Action, EditAction, State
} from './types';
import { PendingState } from './state';

// makeActionTransformer is a selector that should be used to
// intercept an action before it gets handled by the entity reducer(s)
export const makeActionTransformer = (
  schema: ModelSchemaReader,
  actionTypes: ActionTypes,
  selectors: Selectors
): DeriveActionWithOps => {
  const transformAction = (state: State, action: Action, pending?: PendingState): OpAction => {
    const pendingState = pending || new PendingState(schema, state, selectors);

    if (action.type === actionTypes.BATCH) {
      const batchAction = action as BatchAction;

      batchAction.actions.forEach(action => transformAction(state, action, pendingState));
      batchAction.ops = pendingState.getOps();

      return batchAction;
    }

    if (action.type === actionTypes.ADD) {
      const addAction = action as AddAction;
      const { entity, id, data } = addAction;

      if (selectors.checkResource(state, { entity, id })) {
        addAction.ops = [];
        return addAction;
      }

      pendingState.addResource(entity, id, data);

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

      addAction.ops = pendingState.getOps();

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

      removeAction.ops = pendingState.getOps();

      return removeAction;
    }

    if (action.type === actionTypes.EDIT) {
      const editAction = action as EditAction;
      const { entity, id, data } = editAction;

      if (!selectors.checkResource(state, { entity, id })) {
        editAction.ops = [];
        return editAction;
      }

      pendingState.editResource(entity, id, data);

      editAction.ops = pendingState.getOps();

      return editAction;
    }

    if (action.type === actionTypes.ATTACH) {
      const attachAction = action as AttachAction;
      const { entity, id, rel, relId, index, reciprocalIndex } = attachAction;

      pendingState.attachResources(entity, id, rel, relId, index, reciprocalIndex);

      attachAction.ops = pendingState.getOps();

      return attachAction;
    }

    if (action.type === actionTypes.DETACH) {
      const detachAction = action as DetachAction;
      const { entity, id, rel, relId } = detachAction;

      pendingState.detachResources(entity, id, rel, relId);

      detachAction.ops = pendingState.getOps();

      return detachAction;
    }

    if (action.type === actionTypes.MOVE_ATTACHED) {
      const moveAttachedAction = action as MoveAttachedAction;
      const { entity, id, rel, src, dest } = moveAttachedAction;

      pendingState.moveAttachedResource(entity, id, rel, src, dest);

      moveAttachedAction.ops = pendingState.getOps();

      return moveAttachedAction;
    }

    return action;
  };

  return transformAction;
};
