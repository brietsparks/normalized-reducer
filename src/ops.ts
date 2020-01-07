import { AddRelIdOp, AddResourceOp, MoveRelIdOp, OpTypes, RemoveRelIdOp, RemoveResourceOp } from './types';

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
