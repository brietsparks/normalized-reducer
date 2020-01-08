//
// Op: an atomic unit-of-work which a relational reducer can act upon
//

export enum OpTypes {
  ADD_RESOURCE = 'ADD_RESOURCE',
  REMOVE_RESOURCE = 'REMOVE_RESOURCE',
  EDIT_RESOURCE = 'EDIT_RESOURCE',
  MOVE_RESOURCE = 'MOVE_RESOURCE',
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
  data?: object,
}

export interface RemoveResourceOp extends Op {
  opType: OpTypes.REMOVE_RESOURCE,
}

export interface EditResourceOp extends Op {
  opType: OpTypes.EDIT_RESOURCE,
  data: { [key: string]: any },
}

export interface MoveResourceOp extends Omit<Op, 'id'> {
  opType: OpTypes.MOVE_RESOURCE,
  src: number,
  dest: number,
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
// Action: a request object that is an argument to the reducer
//

export interface Action {
  type: string,
}

export interface OpAction extends Action {
  ops?: Op[],
}

// actions
export interface AddAction extends OpAction {
  entity: string,
  id: string,
  data?: object,
  attach?: AddAttachable[],
  index?: number,
}

export interface AddAttachable {
  rel: string,
  id: string,
  index?: number,
  reciprocalIndex?: number,
}

export interface RemoveAction extends OpAction {
  entity: string,
  id: string,
}

export interface EditAction extends OpAction {
  entity: string,
  id: string,
  data: object
}

export interface MoveAction extends Omit<OpAction, 'id'> {
  entity: string,
  src: number,
  dest: number,
}

export interface AttachAction extends OpAction {
  entity: string,
  id: string,
  rel: string,
  relId: string,
  index?: number, // the index within the base resource where the relId should be placed
  reciprocalIndex?: number, // the index within the rel resource where base id should be placed
}

export interface DetachAction extends OpAction {
  entity: string,
  id: string,
  rel: string,
  relId: string,
}

export interface MoveAttachedAction extends OpAction {
  entity: string,
  id: string,
  rel: string,
  src: number,
  dest: number,
}

export type ConcreteOpAction =
  AddAction |
  RemoveAction |
  EditAction |
  MoveAction |
  AttachAction |
  DetachAction |
  MoveAttachedAction;

export interface BatchAction extends Action {
  actions: ConcreteOpAction[],
  ops?: Op[],
}

export interface SetStateAction<S extends AbstractState> {
  type: string,
  state: S
}

export interface SetEntityState {
  type: string,
  entity: string,
  state: AbstractEntityState
}

export interface SetResourceState {
  type: string,
  entity: string,
  id: string,
  state: AbstractResourceState
}

export interface SetRelState {
  type: string,
  entity: string,
  id: string,
  rel: string,
  state: AbstractRelDataState
}

// action creators
export type AddActionCreator = (entity: string, id: string, data?: object, attach?: AddAttachable[], index?: number) => AddAction;
export type RemoveActionCreator = (entity: string, id: string) => RemoveAction;
export type EditActionCreator = (entity: string, id: string, data: object) => EditAction;
export type MoveActionCreator = (entity: string, src: number, dest: number) => MoveAction;
export type AttachActionCreator = (entity: string, id: string, rel: string, relId: string, opts?: { index?: number, reciprocalIndex?: number }) => AttachAction;
export type DetachActionCreator = (entity: string, id: string, rel: string, relId: string) => DetachAction;
export type MoveAttachedActionCreator = (entity: string, id: string, rel: string, src: number, dest: number) => MoveAttachedAction;
export type BatchActionCreator = (...actions: ConcreteOpAction[]) => BatchAction;
export type SetStateActionCreator <T extends AbstractState> = (state: T) => SetStateAction<T>;
export type SetEntityStateCreator = (entity: string, state: AbstractEntityState) => SetEntityState;
export type SetResourceStateCreator = (entity: string, id: string, state: AbstractResourceState) => SetResourceState;
export type SetRelStateCreator = (entity: string, id: string, rel: string, state: AbstractRelDataState) => SetRelState;

export interface ActionTypes {
  ADD: string,
  REMOVE: string,
  EDIT: string,
  MOVE: string,
  ATTACH: string,
  DETACH: string,
  MOVE_ATTACHED: string,
  BATCH: string
  SET_STATE: string,
  SET_ENTITY_STATE: string,
  SET_RESOURCE_STATE: string,
  SET_REL_STATE: string,
}

export interface ActionCreators<T extends AbstractState> {
  add: AddActionCreator,
  remove: RemoveActionCreator,
  edit: EditActionCreator,
  move: MoveActionCreator,
  attach: AttachActionCreator,
  detach: DetachActionCreator,
  moveAttached: MoveAttachedActionCreator,
  batch: BatchActionCreator,
  setState: SetStateActionCreator<T>,
  setEntityState: SetEntityStateCreator,
  setResourceState: SetResourceStateCreator,
  setRelState: SetRelStateCreator,
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
export type AbstractResourceState = { [attr: string]: AbstractRelDataState | any }
export type AbstractRelDataState = undefined | string | string[]


//
// selector types
//

export type DeriveActionWithOps <S extends AbstractState> = (state: S, action: OpAction) => OpAction;
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
