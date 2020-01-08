import {
  EntitiesState,
  Cardinalities,
  Selectors, State,
} from './types';

import { OpsBatch } from './ops';
import { ModelSchemaReader } from './schema';

export class PendingState {
  schema: ModelSchemaReader;
  state: State;
  selectors: Selectors;
  ops: OpsBatch;

  constructor(schema: ModelSchemaReader, state: State, selectors: Selectors) {
    this.schema = schema;
    this.state = state;
    this.selectors = selectors;
    this.ops = new OpsBatch(schema);
  }

  getOps() {
    return this.ops.getAll();
  }

  // whether the resource exists or will be added
  checkExistence(entity: string, id: string) {
    return (
      this.selectors.checkResource(this.state, { entity, id }) ||
      !!this.ops.getAddResource(entity, id)
    );
  }

  addResource(entity: string, id: string, data?: object) {
    this.ops.putAddResource(entity, id, data);
  }

  removeResource(entity: string, id: string) {
    this.ops.putRemoveResource(entity, id);

    const attachedIdsByRel = this.selectors.getEntityAttachedArr(this.state, { entity, id });

    Object.entries(attachedIdsByRel).forEach(([rel, attachedIds]) => {
      attachedIds.forEach(attachedId => {
        this.detachResources(entity, id, rel, attachedId);
      })
    });
  }

  editResource(entity: string, id: string, data: object) {
    this.ops.putEditResource(entity, id, data);
  }

  attachResources(entity: string, id: string, rel: string, relId: string, index?: number, reciprocalIndex?: number) {
    const entitySchema = this.schema.entity(entity);

    const relEntity = entitySchema.getRelEntity(rel);
    const reciprocalRel = entitySchema.getReciprocalRel(rel);
    if (!relEntity || !reciprocalRel) {
      return;
    }

    // both must exist
    if (!this.checkExistence(entity, id) || !this.checkExistence(relEntity, relId)) {
      return;
    }

    // detach occupants
    this.detachOccupant(entity, id, rel);
    this.detachOccupant(relEntity, relId, reciprocalRel);

    // negate any existing removeRelIdOps
    this.ops.deleteRemoveRelId(entity, id, rel, relId);
    this.ops.deleteRemoveRelId(relEntity, relId, reciprocalRel, id);

    // batch the addRelOps
    this.ops.putAddRelId(entity, id, rel, relId, index);
    this.ops.putAddRelId(relEntity, relId, reciprocalRel, id, reciprocalIndex);
  }

  detachResources(entity: string, id: string, rel: string, relId: string) {
    const entitySchema = this.schema.entity(entity);

    const relEntity = entitySchema.getRelEntity(rel);
    const reciprocalRel = entitySchema.getReciprocalRel(rel);
    if (!relEntity || !reciprocalRel) {
      return;
    }

    // negate any existing addRelOps
    this.ops.deleteAddRelId(entity, id, rel, relId);
    this.ops.deleteAddRelId(relEntity, relId, reciprocalRel, id);

    // batch the removeRelIdOps
    this.ops.putRemoveRelId(entity, id, rel, relId);
    this.ops.putRemoveRelId(relEntity, relId, reciprocalRel, id);
  }

  private detachOccupant(entity: string, id: string, rel: string) {
    const entitySchema = this.schema.entity(entity);
    const relEntity = entitySchema.getRelEntity(rel);
    const reciprocalRel = entitySchema.getReciprocalRel(rel);

    if (!relEntity || !reciprocalRel) {
      return;
    }

    const cardinality = entitySchema.getCardinality(rel);

    if (cardinality === Cardinalities.ONE) {
      // get attached from state
      let occupantId = this.selectors.getAttached(this.state, { entity, id, rel }) as string;

      // get attached from batch
      if (!occupantId) {
        const occupantOp = this.ops.getAddRelId(entity, id, rel);

        if (occupantOp) {
          occupantId = occupantOp.relId;
        }
      }

      if (occupantId) {
        this.ops.putRemoveRelId(relEntity, occupantId, reciprocalRel, id);
      }
    }
  }
}
