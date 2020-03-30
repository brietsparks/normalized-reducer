import {
  Id,
  State,
  AnyAction,
  DerivableAction,
  DerivedAction,
  ActionTypes,
  AttachAction,
  DetachAction,
  Selectors,
  ActionCreators,
  DeleteAction,
  InvalidAction,
} from './interfaces';

import { Cardinalities } from './enums';

import { ModelSchemaReader } from './schema';

export default class Derivator<S extends State> {
  actionTypes: ActionTypes;
  actionCreators: ActionCreators;
  schema: ModelSchemaReader;
  selectors: Selectors<S>;

  constructor(
    actionTypes: ActionTypes,
    actionCreators: ActionCreators,
    schema: ModelSchemaReader,
    selectors: Selectors<S>
  ) {
    this.actionTypes = actionTypes;
    this.actionCreators = actionCreators;
    this.schema = schema;
    this.selectors = selectors;
  }

  public deriveAction(state: S, action: AnyAction): DerivedAction | AnyAction {
    if (action.type === this.actionTypes.DETACH) {
      const detachAction = action as DetachAction;
      const derivedActions = this.deriveDetachActions(detachAction);
      return {
        type: action.type,
        original: action,
        derived: derivedActions,
      } as DerivedAction<DetachAction>;
    }

    if (action.type === this.actionTypes.ATTACH) {
      const attachAction = action as AttachAction;
      const derivedActions = this.deriveAttachActions(state, attachAction);

      return {
        type: action.type,
        original: action,
        derived: derivedActions,
      } as DerivedAction<AttachAction>;
    }

    if (action.type === this.actionTypes.DELETE) {
      const deleteAction = action as DeleteAction;
      const derivedActions = this.deriveDeleteActions(state, deleteAction);

      return {
        type: action.type,
        original: action,
        derived: derivedActions,
      } as DerivedAction<DeleteAction>;
    }

    return action;
  }

  private deriveDetachActions(action: DetachAction): (DerivableAction | InvalidAction)[] {
    const { entityType, id, relation, relatedId } = action;

    const schema = this.schema.type(entityType);

    const relationType = schema.resolveRelationType(relation);
    const reciprocalKey = schema.resolveRelationReciprocalKey(relation);

    if (!relationType || !reciprocalKey) {
      return [action];
    }

    const reciprocalAction = this.actionCreators.detach(relationType, relatedId, reciprocalKey, id);

    return [action, reciprocalAction];
  }

  private deriveAttachActions(state: S, action: AttachAction): (DerivableAction | InvalidAction)[] {
    const { entityType, id, relation, relatedId } = action;

    const schema = this.schema.type(entityType);

    const relationType = schema.resolveRelationType(relation);
    if (!relationType) {
      return [];
    }

    // check existence of attachable entity
    const attachableEntity = this.selectors.getEntity(state, {
      type: relationType,
      id: relatedId,
    });
    const reciprocalKey = schema.resolveRelationReciprocalKey(relation);
    if (!attachableEntity || !reciprocalKey) {
      return [];
    }

    //
    // make the attach-action
    //
    const relAttachAction = this.actionCreators.attach(relationType, relatedId, reciprocalKey, id, {
      index: action.reciprocalIndex,
      reciprocalIndex: action.index,
    });

    //
    // make the detach-actions for the occupant entities
    //
    const entityDetachments = this.detachOccupant(state, entityType, id, relation);
    const relEntityDetachments = this.detachOccupant(state, relationType, relatedId, reciprocalKey);

    return [action, relAttachAction, ...entityDetachments, ...relEntityDetachments];
  }

  private deriveDeleteActions(state: S, action: DeleteAction) {
    const { entityType, id } = action;

    const entitySchema = this.schema.type(entityType);
    if (!entitySchema) {
      return [];
    }

    // get all attached entities
    const attachedIdsByRelationKey = this.selectors.getAllAttachedIds(state, {
      type: entityType,
      id,
    });

    // derive detachment actions
    const detachActions: (DetachAction | InvalidAction)[] = Object.entries<Id[]>(
      attachedIdsByRelationKey
    ).reduce((allDetachActions, [relationKey, attachedIds]) => {
      const relationType = entitySchema.resolveRelationType(relationKey);
      if (!relationType) {
        return allDetachActions;
      }

      const reciprocalKey = entitySchema.resolveRelationReciprocalKey(relationKey);
      if (!reciprocalKey) {
        return allDetachActions;
      }

      const detachActions = attachedIds.map(attachedId =>
        this.actionCreators.detach(relationType, attachedId, reciprocalKey, id)
      );

      allDetachActions.push(...detachActions);

      return allDetachActions;
    }, [] as (DetachAction | InvalidAction)[]);

    return [action, ...detachActions];
  }

  private detachOccupant(state: S, entityType: string, id: Id, relation: string) {
    const schema = this.schema.type(entityType);
    const relationType = schema.resolveRelationType(relation);
    const relationReciprocalKey = schema.resolveRelationReciprocalKey(relation);
    const cardinality = schema.resolveRelationCardinality(relation);

    if (!relationType || !relationReciprocalKey || cardinality === Cardinalities.MANY) {
      return [];
    }

    let occupantId = this.selectors.getAttached<Id>(state, {
      type: entityType,
      id,
      relation,
    });
    if (!occupantId) {
      return [];
    }

    return [
      this.actionCreators.detach(entityType, id, relationType, occupantId),
      this.actionCreators.detach(relationType, occupantId, relationReciprocalKey, id),
    ];
  }
}
