import {
  ResourcesByEntityState,
  AddRelIdOp,
  AddResourceOp,
  Cardinalities,
  EditResourceOp,
  MoveRelIdOp,
  OpTypes,
  RemoveRelIdOp,
  RemoveResourceOp
} from './types';
import { ModelSchemaReader } from './schema';

export const makeAddResourceOp = (entity: string, id: string, data?: object): AddResourceOp => {
  return {
    opType: OpTypes.ADD_RESOURCE,
    entity,
    id,
    data,
  };
};

export const makeRemoveResourceOp = (entity: string, id: string): RemoveResourceOp => {
  return {
    opType: OpTypes.REMOVE_RESOURCE,
    entity,
    id,
  }
};

export const makeEditResourceOp = (entity: string, id: string, data: object): EditResourceOp => {
  return {
    opType: OpTypes.EDIT_RESOURCE,
    entity,
    id,
    data
  };
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

export const makeMoveRelIdOp = (entity: string, id: string, rel: string, src: number, dest:number): MoveRelIdOp => {
  return {
    opType: OpTypes.MOVE_REL_ID,
    entity,
    id,
    rel,
    src,
    dest,
  };
};

export class OpsBatch {
  ops: Record<string, any> = {};
  schema: ModelSchemaReader;

  constructor(schema: ModelSchemaReader) {
    this.schema = schema;
  }

  getAll() {
    return Object.values(this.ops);
  }

  //
  // addResource
  //
  putAddResource(entity: string, id: string, data?: object) {
    const key = concat(OpTypes.ADD_RESOURCE, entity, id);
    this.ops[key] = makeAddResourceOp(entity, id, data);
  }
  getAddResource(entity: string, id: string) {
    const key = concat(OpTypes.ADD_RESOURCE, entity, id);
    return this.ops[key];
  }
  deleteAddResource(entity: string, id: string) {
    throw new Error('deleteAddResource not implemented');
  }

  //
  // removeResource
  //
  putRemoveResource(entity: string, id: string) {
    const key = concat(OpTypes.REMOVE_RESOURCE, entity, id);
    this.ops[key] = makeRemoveResourceOp(entity, id);
  }
  getRemoveResource(entity: string, id: string) {
    throw new Error('getRemoveResource not implemented');
  }
  deleteRemoveResource(entity: string, id: string) {
    throw new Error('deleteRemoveResource not implemented');
  }

  //
  // editResource
  //
  putEditResource(entity: string, id: string, data: object) {
    const key = concat(OpTypes.EDIT_RESOURCE, entity, id);
    this.ops[key] = makeEditResourceOp(entity, id, data);
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
    return concat(OpTypes.ADD_REL_ID, entity, id, rel, isSingular ? undefined : relId);
  }

  //
  // moveRelId
  //
  putMoveRelId(entity: string, id: string, rel: string, src: number, dest: number) {
    const key = concat(OpTypes.MOVE_REL_ID, entity, id, rel, String(src), String(dest));
    this.ops[key] = makeMoveRelIdOp(entity, id, rel, src, dest);
  }
  getMoveRelId() {
    throw new Error('getMoveRelId not implemented');
  }
  deleteMoveRelId() {
    throw new Error('deleteMoveRelId not implemented');
  }

  //
  // removeRelId
  //
  putRemoveRelId(entity: string, id: string, rel: string, relId: string) {
    const key = concat(entity, id, rel, relId);
    this.ops[key] = makeRemoveRelIdOp(entity, id, rel, relId);
  }
  getRemoveRelId(entity: string, id: string, rel: string, relId: string) {
    throw new Error('getRemoveRelId not implemented');
  }
  deleteRemoveRelId(entity: string, id: string, rel: string, relId: string) {
    const key = concat(entity, id, rel, relId);
    if (key) {
      delete this.ops[key];
    }
  }
}
