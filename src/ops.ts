import { AddRelIdOp, AddResourceOp, OpTypes, RemoveRelIdOp, RemoveResourceOp } from './types';

export const makeAddResourceOp = (entity: string, id: string): AddResourceOp => {
  return {
    opType: OpTypes.ADD_RESOURCE,
    entity,
    id
  };
};

export const makeRemoveResourceOp = (entity: string, id: string, rel: string, relId: string): RemoveResourceOp => {
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

  if (index) {
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
