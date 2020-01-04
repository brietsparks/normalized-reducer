//
// Op: an atomic unit-of-work which a relational reducer can act upon
//

export enum OpTypes {
  ADD_RESOURCE = 'ADD_RESOURCE',
  REMOVE_RESOURCE = 'REMOVE_RESOURCE',
  ADD_REL_ID = 'ADD_REL_ID',
  REMOVE_REL_ID = 'REMOVE_REL_ID',
  MOVE_REL_ID = 'MOVE_REL_ID',
}

export interface Op {
  opType: string,
  entity: string,
  id: string,
}

export interface AddResourceOp extends Op {
  opType: OpTypes.ADD_RESOURCE,
}

export interface RemoveResourceOp extends Op {
  opType: OpTypes.REMOVE_RESOURCE,
}

export interface AddRelIdOp extends Op {
  rel: string,
  relId: string,
  index?: number,
  reciprocalIndex?: number,
}

export interface RemoveRelIdOp extends Op {
  rel: string,
  relId?: string,
}

export interface MoveRelIdOp extends Op {
  rel: string,
  src: number,
  dest: number,
}

//
// Payload: a body of domain data
//

export interface AddPayload {
  entity: string,
  id: string,
  attach?: AddPayloadAttachable[],
  options?: AddPayloadOptions,
}

export interface AddPayloadAttachable {
  rel: string,
  id: string,
  index?: number,
  reciprocalIndex?: number,
}

export interface AddPayloadOptions {
  // ifExists?: ExistingResourceStrategy, // what to do if an addable resource's id already exists
}

export interface RemovePayload {
  entity: string,
  id: string,
}

export interface AttachPayload {
  entity: string,
  id: string,
  rel: string,
  relId: string,
  index?: number, // the index within the base resource where the relId should be placed
  reciprocalIndex?: number, // the index within the rel resource where base id should be placed
}

export interface DetachPayload {
  entity: string,
  id: string,
  rel: string,
  relId: string,
}

export interface MoveAttachedPayload {
  entity: string,
  id: string,
  rel: string,
  src: number,
  dest: number,
}

//
// Action: a request object that is an argument to the reducer
//

export interface Action {
  type: string,
  entity: string,
  id: string,
  ops?: Op[],
}

// actions
export type AddAction = Action & AddPayload;
export type RemoveAction = Action & RemovePayload;
export type AttachAction = Action & AttachPayload;
export type DetachAction = Action & DetachPayload;
export type MoveAttachedAction = Action & MoveAttachedPayload;

// action creators
export type AddActionCreator = (entity: string, id: string, attach?: AddPayloadAttachable[], options?: AddPayloadOptions) => AddAction;
export type RemoveActionCreator = (entity: string, id: string) => RemoveAction;
export type AttachActionCreator = (entity: string, id: string, rel: string, relId: string, opts?: { index?: number, reciprocalIndex?: number }) => AttachAction;
export type DetachActionCreator = (entity: string, id: string, rel: string, relId: string) => DetachAction;
export type MoveAttachedActionCreator = (entity: string, id: string, rel: string, src: number, dest: number) => MoveAttachedAction;

export interface ActionTypes {
  ADD: string,
  REMOVE: string,
  ATTACH: string,
  DETACH: string,
  MOVE_ATTACHED: string,
}

export interface ActionCreators {
  add: AddActionCreator,
  remove: RemoveActionCreator,
  attach: AttachActionCreator,
  detach: DetachActionCreator,
  moveAttached: MoveAttachedActionCreator,
}

//
// schema types
//

export interface ModelSchema {
  [entity: string]: EntitySchema
}

export interface EntitySchema {
  [rel: string]: RelSchema
}

export type RelSchema = {
  entity: string,
  cardinality: Cardinality,
  reciprocal: string,
}

export type Cardinality = Cardinalities[keyof Cardinalities];

export enum Cardinalities {
  ONE = 'one',
  MANY = 'many',
}

//
// state types
//

export type AbstractState = { [entity: string]: AbstractEntityState }
export type AbstractEntityState = { [id: string]: AbstractResourceState }
export type AbstractResourceState = { [rel: string]: AbstractRelDataState }
export type AbstractRelDataState = undefined | string | string[]


//
// selector types
//

export type DeriveActionWithOps <S extends AbstractState> = (state: S, action: Action) => Action;
export type CheckResource <S extends AbstractState> = (state: S, args: { entity: string, id: string }) => boolean;
export type GetAttached <S extends AbstractState> = (state: S, args: { entity: string, id: string, rel: string }) => string[]|string|undefined;
export type GetArr <S extends AbstractState> = (state: S, args: { entity: string, id: string, rel: string }) => string[]
export type GetEntityAttachedArr <S extends AbstractState> = (state: S, args: { entity: string, id: string }) => { [rel: string]: string[] };

export interface Selectors<S extends AbstractState> {
  checkResource: CheckResource<S>
  getAttached: GetAttached<S>,
  getAttachedArr: GetArr<S>,
  getEntityAttachedArr: GetEntityAttachedArr<S>,
}


//
// reducer types
//

export type EntityReducer = (state: AbstractEntityState, ops: Op[]) => AbstractEntityState;
export interface EntityReducers {
  [entity: string]: EntityReducer
}

//
// option types
//

export type InvalidEntityHandler = (entity: string) => void;
export type NonexistentResourceHandler = (entity: string, id: string) => void;
export type InvalidRelHandler = (entity: string, rel: string) => void;
export type InvalidRelDataHandler = (entity: string, rel: string, data: any) => void;

export type ExistingResourceStrategy = 'ignore' | 'put' | 'patch'; // put replaces completely; patch merges their attached ids

export type Namespaced = (actionType: string) => string;
