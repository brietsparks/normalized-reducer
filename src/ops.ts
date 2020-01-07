import {
  AbstractState,
  AddRelIdOp,
  AddResourceOp,
  ModelSchema,
  MoveRelIdOp,
  OpTypes,
  RemoveRelIdOp,
  RemoveResourceOp,
  Cardinalities
} from './types';
import { ModelSchemaReader } from './schema';


export const makeAddResourceOp = (entity: string, id: string): AddResourceOp => {
  return {
    opType: OpTypes.ADD_RESOURCE,
    entity,
    id
  };
};

export const makeRemoveResourceOp = (entity: string, id: string): RemoveResourceOp => {
  return {
    opType: OpTypes.REMOVE_RESOURCE,
    entity,
    id,
  }
};

export const makeAddRelIdOp = (entity: string, id: string, rel: string, relId: string, index?: number): AddRelIdOp => {
  const op: AddRelIdOp = {
    opType: OpTypes.ADD_REL_ID,
    entity,
    id,
    rel,
    relId,
  };

  // must check against undefined because index might === 0
  if (index !== undefined) {
    op.index = index;
  }

  return op;
};

export const makeRemoveRelIdOp = (entity: string, id: string, rel: string, relId?: string): RemoveRelIdOp => {
  return {
    opType: OpTypes.REMOVE_REL_ID,
    entity,
    id,
    rel,
    relId,
  };
};

const concat = (...strings: (string|undefined)[]) => strings.filter(s => s !== undefined).join('.');

export const makeMoveAttachedOp = (entity: string, id: string, rel: string, src: number, dest:number): MoveRelIdOp => {
  return {
    opType: OpTypes.MOVE_REL_ID,
    entity,
    id,
    rel,
    src,
    dest,
  };
};

export class OpsBatch<S extends AbstractState> {
  ops: Record<string, any> = {};
  schema: ModelSchemaReader<S>;

  constructor(schema: ModelSchemaReader<S>) {
    this.schema = schema;
  }

  getAll() {
    return Object.values(this.ops);
  }

  //
  // addResource
  //
  putAddResource(entity: string, id: string) {
    const key = concat(entity, id);
    this.ops[key] = makeAddResourceOp(entity, id);
  }
  getAddResource(entity: string, id: string) {
    const key = concat(entity, id);
    return this.ops[key];
  }
  deleteAddResource(entity: string, id: string) {
    const key = concat(entity, id);
    if (key) {
      delete this.ops[key];
    }
  }

  //
  // removeResource
  //
  putRemoveResource(entity: string, id: string) {
    const key = concat(entity, id);
    this.ops[key] = makeRemoveResourceOp(entity, id);
  }
  getRemoveResource(entity: string, id: string) {
    const key = concat(entity, id);
    return this.ops[key];
  }
  deleteRemoveResource(entity: string, id: string) {
    const key = concat(entity, id);
    if (key) {
      delete this.ops[key];
    }
  }

  //
  // addRelId
  //
  putAddRelId(entity: string, id: string, rel: string, relId: string, index?: number) {
    const key = this.makeAddRelIdKey(entity, id, rel, relId);
    this.ops[key] = makeAddRelIdOp(entity, id, rel, relId, index);

  }
  getAddRelId(entity: string, id: string, rel: string, relId?: string) {
    const key = this.makeAddRelIdKey(entity, id, rel, relId);
    return this.ops[key];
  }
  deleteAddRelId(entity: string, id: string, rel: string, relId?: string) {
    const key = this.makeAddRelIdKey(entity, id, rel, relId);
    if (key) {
      delete this.ops[key];
    }
  }
  private makeAddRelIdKey(entity: string, id: string, rel: string, relId?: string) {
    const isSingular = this.schema.entity(entity).getCardinality(rel) === Cardinalities.ONE;
    return concat(entity, id, rel, isSingular ? undefined : relId);
  }

  //
  // moveRelId
  //
  putMoveRelId() {
  }
  getMoveRelId() {
  }
  deleteMoveRelId() {
  }

  //
  // removeRelId
  //
  putRemoveRelId(entity: string, id: string, rel: string, relId: string) {
    const key = concat(entity, id, rel, relId);
    this.ops[key] = makeRemoveRelIdOp(entity, id, rel, relId);
  }
  getRemoveRelId(entity: string, id: string, rel: string, relId: string) {
  }
  deleteRemoveRelId(entity: string, id: string, rel: string, relId: string) {
    const key = concat(entity, id, rel, relId);
    if (key) {
      delete this.ops[key];
    }
  }
}
