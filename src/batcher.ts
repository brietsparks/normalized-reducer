import {
  AbstractState,
  ActionTypes,
  AddAction,
  AttachAction,
  Cardinalities,
  Cardinality,
  DetachAction,
  Selectors,
  Op,
  OpTypes, AddRelIdOp, AddResourceOp, RemoveRelIdOp, RemoveResourceOp,
} from './types';

import { makeAddResourceOp, makeAddRelIdOp, makeRemoveRelIdOp, makeRemoveResourceOp } from './ops';
import { ModelSchemaReader } from './schema';

export class Batcher<S extends AbstractState> {
  schema: ModelSchemaReader<S>;
  state: S;
  selectors: Selectors<S>;
  ops: Record<string, any> = {};

  constructor(schema: ModelSchemaReader<S>, state: S, selectors: Selectors<S>) {
    this.schema = schema;
    this.state = state;
    this.selectors = selectors;
  }

  getAll() {
    return Object.values(this.ops);
  }

  get(op: Op) {
    const key = this.makeOpKey(op);
    return key ? this.ops[key] : undefined;
  }

  getByKey(key: string) {
    return this.ops[key];
  }

  // whether the resource exists or will be added
  checkExistence(entity: string, id: string) {
    return (
      this.selectors.checkResource(this.state, { entity, id }) ||
      !!this.get(makeAddResourceOp(entity, id))
    );
  }

  addResource(entity: string, id: string) {
    this.put(makeAddResourceOp(entity, id));
  }

  removeResource(entity: string, id: string) {
    this.put(makeRemoveResourceOp(entity, id));

    const attachedIdsByRel = this.selectors.getEntityAttachedArr(this.state, { entity, id });

    Object.entries(attachedIdsByRel).forEach(([rel, attachedIds]) => {
      attachedIds.forEach(attachedId => {
        this.detachResources(entity, id, rel, attachedId);
      })
    });
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
    this.remove(makeRemoveRelIdOp(entity, id, rel, relId));
    this.remove(makeRemoveRelIdOp(relEntity, relId, reciprocalRel, id));

    // batch the addRelOps
    this.put(makeAddRelIdOp(entity, id, rel, relId, index));
    this.put(makeAddRelIdOp(relEntity, relId, reciprocalRel, id, reciprocalIndex));
  }

  detachResources(entity: string, id: string, rel: string, relId: string) {
    const entitySchema = this.schema.entity(entity);

    const relEntity = entitySchema.getRelEntity(rel);
    const reciprocalRel = entitySchema.getReciprocalRel(rel);
    if (!relEntity || !reciprocalRel) {
      return;
    }

    // negate any existing addRelOps
    this.remove(makeAddRelIdOp(entity, id, rel, relId));
    this.remove(makeAddRelIdOp(relEntity, relId, reciprocalRel, id));

    // batch the removeRelIdOps
    this.put(makeRemoveRelIdOp(entity, id, rel, relId));
    this.put(makeRemoveRelIdOp(relEntity, relId, reciprocalRel, id));
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
        // todo: this is a hack to get the addRelIdOp
        const occupantOp = this.getByKey(concat(OpTypes.ADD_REL_ID, entity, id, rel));

        if (occupantOp) {
          occupantId = occupantOp.relId;
        }
      }

      if (occupantId) {
        this.put(makeRemoveRelIdOp(relEntity, occupantId, reciprocalRel, id));
      }
    }
  }

  private put(op: Op) {
    const key = this.makeOpKey(op);

    if (key) {
      this.ops[key] = op;
    }
  }

  private remove(op: Op) {
    const key = this.makeOpKey(op);

    if (key) {
      delete this.ops[key];
    }
  }

  private makeOpKey(op: Op) {
    if (op.opType === OpTypes.ADD_RESOURCE) {
      const addResourceOp = op as AddResourceOp;
      return makeAddResourceOpKey(addResourceOp);
    }

    if (op.opType === OpTypes.REMOVE_RESOURCE) {
      const removeResourceOp = op as RemoveResourceOp;
      return makeRemoveResourceOpKey(removeResourceOp);
    }

    if (op.opType === OpTypes.ADD_REL_ID) {
      const addRelIdOp = op as AddRelIdOp;
      const cardinality = this.schema.entity(addRelIdOp.entity).getCardinality(addRelIdOp.rel);
      return makeAddRelIdOpKey(addRelIdOp, cardinality === Cardinalities.ONE);
    }

    if (op.opType === OpTypes.REMOVE_REL_ID) {
      const removeRelIdOp = op as RemoveRelIdOp;
      const cardinality = this.schema.entity(removeRelIdOp.entity).getCardinality(removeRelIdOp.rel);
      return makeRemoveRelIdOpKey(removeRelIdOp, cardinality === Cardinalities.ONE);
    }
  };
}

const makeAddResourceOpKey = (op: AddResourceOp) => concat(OpTypes.ADD_RESOURCE, op.entity, op.id);
const makeRemoveResourceOpKey = (op: RemoveResourceOp) => concat(OpTypes.REMOVE_RESOURCE, op.entity, op.id);
const makeAddRelIdOpKey = (op: AddRelIdOp, singular: boolean) => concat(OpTypes.ADD_REL_ID, op.entity, op.id, op.rel, singular ? undefined : op.relId);
const makeRemoveRelIdOpKey = (op: RemoveRelIdOp, singular: boolean) => concat(OpTypes.REMOVE_REL_ID, op.entity, op.id, op.rel, singular ? undefined : op.relId);
const concat = (...strings: (string|undefined)[]) => strings.filter(s => s !== undefined).join('.');
