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
}

export interface AddResourceOp extends Op {
  id: string,
  opType: OpTypes.ADD_RESOURCE,
  data?: object,
  index?: number,
}

export interface RemoveResourceOp extends Op {
  id: string,
  opType: OpTypes.REMOVE_RESOURCE,
}

export interface EditResourceOp extends Op {
  id: string,
  opType: OpTypes.EDIT_RESOURCE,
  data: { [key: string]: any },
}

export interface MoveResourceOp extends Op {
  opType: OpTypes.MOVE_RESOURCE,
  src: number,
  dest: number,
}

export interface AddRelIdOp extends Op {
  id: string,
  rel: string,
  relId: string,
  index?: number,
  reciprocalIndex?: number,
}

export interface RemoveRelIdOp extends Op {
  id: string,
  rel: string,
  relId?: string,
}

export interface MoveRelIdOp extends Op {
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

export interface SetStateAction {
  type: string,
  state: ResourcesByEntityState
}

export interface SetEntityState {
  type: string,
  entity: string,
  state: ResourcesState
}

export interface SetResourceState {
  type: string,
  entity: string,
  id: string,
  state: ResourceState
}

export interface SetRelState {
  type: string,
  entity: string,
  id: string,
  rel: string,
  state: RelDataState
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
export type SetStateActionCreator = (state: ResourcesByEntityState) => SetStateAction;
export type SetEntityStateCreator = (entity: string, state: ResourcesState) => SetEntityState;
export type SetResourceStateCreator = (entity: string, id: string, state: ResourceState) => SetResourceState;
export type SetRelStateCreator = (entity: string, id: string, rel: string, state: RelDataState) => SetRelState;

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

export interface ActionCreators {
  add: AddActionCreator,
  remove: RemoveActionCreator,
  edit: EditActionCreator,
  move: MoveActionCreator,
  attach: AttachActionCreator,
  detach: DetachActionCreator,
  moveAttached: MoveAttachedActionCreator,
  batch: BatchActionCreator,
  setState: SetStateActionCreator,
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

export type State = { resources: ResourcesByEntityState, ids: IdsByEntityState };
export type IdsByEntityState = { [entity: string]: string[] };
export type ResourcesByEntityState = { [entity: string]: ResourcesState };
export type ResourcesState = { [id: string]: ResourceState };
export type ResourceState = { [attr: string]: RelDataState | any };
export type RelDataState = undefined | string | string[];


//
// selector types
//

export type DeriveActionWithOps = (state: State, action: OpAction) => OpAction;
export type CheckResource = (state: State, args: { entity: string, id: string }) => boolean;
export type GetAttached = (state: State, args: { entity: string, id: string, rel: string }) => string[]|string|undefined;
export type GetArr = (state: State, args: { entity: string, id: string, rel: string }) => string[]
export type GetEntityAttachedArr = (state: State, args: { entity: string, id: string }) => { [rel: string]: string[] };

export interface Selectors {
  checkResource: CheckResource,
  getAttached: GetAttached,
  getAttachedArr: GetArr,
  getEntityAttachedArr: GetEntityAttachedArr,
}


//
// reducer types
//

export type EntityIdsReducer = (state: string[], ops: Op[]) => string[];
export interface EntityIdsReducers {
  [entity: string]: EntityIdsReducer
}

export type EntityReducer = (state: ResourcesState, ops: Op[]) => ResourcesState;
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
