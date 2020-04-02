import { Cardinalities, UpdateActionMethod } from './enums';

export type Id = string | number;

export type Namespaced = (actionType: string) => string;

export type Compare<T extends Entity = Entity> = (a: T, b: T) => number;

export interface AnyAction {
  type: string;
}

export interface ActionTypes {
  INVALID: string;
  BATCH: string;
  CREATE: string;
  DELETE: string;
  UPDATE: string;
  MOVE: string;
  ATTACH: string;
  DETACH: string;
  MOVE_ATTACHED: string;
  SORT: string;
  SORT_ATTACHED: string;
  // SET_STATE: string;
  // SET_ALL_IDS: string;
  // SET_ALL_ENTITIES: string;
  // SET_IDS: string;
  // SET_ENTITIES: string;
  // SET_ENTITY: string;
}

export type DerivedAction<A extends DerivableAction = DerivableAction> = {
  type: string;
  original: A;
  derived: DerivableAction[];
};

export interface AnyAction {
  type: string;
}

export type Action = ValidAction | InvalidAction;

export interface InvalidAction {
  type: string;
  error: string;
  action: ValidAction;
}

export type ValidAction = SingularAction | BatchAction;

export type SingularAction = NonDerivableAction | DerivableAction;

export type NonDerivableAction = SetState;

export type DerivableAction =
  | CreateAction
  | DeleteAction
  | UpdateAction
  | MoveAction
  | AttachAction
  | DetachAction
  | MoveAttachedAction;

export interface BatchAction {
  type: string;
  actions: SingularAction[];
}

export interface CreateAction {
  type: string;
  entityType: string;
  id: Id;
  data?: Entity;
  index?: number;
}

export interface DeleteAction {
  type: string;
  entityType: string;
  id: Id;
  cascade?: SelectorTreeSchema;
}

export interface UpdateAction {
  type: string;
  entityType: string;
  id: Id;
  data: object;
  method: UpdateActionMethod;
}

export interface MoveAction {
  type: string;
  entityType: string;
  src: number;
  dest: number;
}

export interface AttachAction {
  type: string;
  entityType: string;
  id: Id;
  relation: string;
  attachableId: Id;
  index?: number;
  reciprocalIndex?: number;
}

export interface DetachAction {
  type: string;
  entityType: string;
  id: Id;
  relation: string;
  detachableId: Id;
}

export interface MoveAttachedAction {
  type: string;
  entityType: string;
  id: Id;
  relation: string;
  src: number;
  dest: number;
}

export interface SortAction<T extends Entity = Entity> {
  type: string;
  entityType: string;
  compare: Compare<T>;
}

export interface SortAttachedAction<T extends Entity = Entity> {
  type: string;
  entityType: string;
  id: string;
  relation: string;
  compare: Compare<T>;
}

export interface SetState {
  type: string;
}

//
// action-creator types
//
export type ActionCreators = {
  batch: BatchActionCreator;
  attach: AttachActionCreator;
  detach: DetachActionCreator;
  delete: DeleteActionCreator;
  create: CreateActionCreator;
  update: UpdateActionCreator;
  move: MoveActionCreator;
  moveAttached: MoveAttachedActionCreator;
  sort: SortActionCreator;
  sortAttached: SortAttachedActionCreator;
};

export type InvalidActionCreator = (action: ValidAction, error: string) => InvalidAction;

export type BatchActionCreator = (...actions: SingularAction[]) => BatchAction;

export type AttachActionCreator = (
  entityType: string,
  id: Id,
  relation: string,
  relatedId: Id,
  options?: { index?: number; reciprocalIndex?: number }
) => AttachAction | InvalidAction;

export type DetachActionCreator = (
  entityType: string,
  id: Id,
  relation: string,
  relatedId: Id
) => DetachAction | InvalidAction;

export type DeleteActionCreator = (
  entityType: string,
  id: Id,
  cascade?: SelectorTreeSchema
) => DeleteAction | InvalidAction;

export type CreateActionCreator = (
  entityType: string,
  id: Id,
  data?: object,
  index?: number
) => CreateAction | InvalidAction;

export type UpdateActionCreator = (
  entityType: string,
  id: Id,
  data: object,
  options?: { method?: UpdateActionMethod }
) => UpdateAction | InvalidAction;

export type MoveActionCreator = (entityType: string, src: number, dest: number) => MoveAction | InvalidAction;

export type MoveAttachedActionCreator = (
  entityType: string,
  id: Id,
  relation: string,
  src: number,
  dest: number
) => MoveAttachedAction | InvalidAction;

export type SortActionCreator = <T extends Entity = Entity>(
  entityType: string,
  compare: Compare<T>
) => SortAction<T> | InvalidAction;

export type SortAttachedActionCreator = <T extends Entity = Entity>(
  entityType: string,
  id: string,
  relation: string,
  compare: Compare<T>
) => SortAction<T> | InvalidAction;

//
// state types
//

export type State = {
  entities: EntitiesByType;
  ids: IdsByType;
};
export type IdsByType = { [type: string]: Id[] };
export type EntitiesByType = { [type: string]: Entities };
export type Entities = { [id: string]: object };
export type Entity = { [k: string]: any };

//
// schema types
//

export interface ModelSchema {
  [type: string]: EntitySchema;
}

export interface EntitySchema {
  [type: string]: RelationSchema;
}

export type RelationSchema = {
  type: string;
  cardinality: Cardinality;
  reciprocal: string;
};

export type Cardinality = Cardinalities[keyof Cardinalities];

//
// selectors
//
export type Selectors<S extends State> = PublicSelectors<S> & InternalSelectors<S>;

export interface PublicSelectors<S extends State> {
  getEntity: GetEntity<S>;
}

export interface InternalSelectors<S extends State> {
  getAttached: GetAttached<S>;
  getAllAttachedIds: GetAllAttachedIds<S>;
  getEntityTree: GetEntityTree<S>;
}

export type GetEntity<S extends State> = <E extends Entity>(
  state: S,
  args: { type: string; id: Id }
) => E | undefined;

export type GetAttached<S extends State> = <T extends Id[] | Id>(
  state: S,
  args: { type: string; id: Id; relation: string }
) => T | undefined;

export type GetAllAttachedIds<S extends State> = (
  state: S,
  args: { type: string; id: Id }
) => { [relationKey: string]: Id[] };

export type GetEntityTree<S extends State> = (
  state: S,
  args: { type: string; id: Id; schema: SelectorTreeSchema }
) => EntityTreeNode[];

export type SelectorTreeSchema = { [relation: string]: SelectorTreeSchema } | (() => SelectorTreeSchema);
export type EntityTreeNode = { id: Id; type: string; entity: Entity };
