import { Cardinalities, UpdateActionMethod } from './enums';

export type Id = string | number;

export type Namespaced = (actionType: string) => string;

export type Compare<T extends Entity = Entity> = (a: T, b: T) => number;

export type Reducer<S extends State> = (state: S, action: Action<S>) => S;

export type Action<S extends State> = SingularAction | InvalidAction | BatchAction | StateSetterAction<S>;

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
  SET_STATE: string;
  // SET_ALL_IDS: string;
  // SET_ALL_ENTITIES: string;
  // SET_IDS: string;
  // SET_ENTITIES: string;
  // SET_ENTITY: string;
}

export interface AnyAction {
  type: string;
}

export type DerivedAction<A extends SingularAction = SingularAction> = {
  type: string;
  original: A;
  derived: SingularAction[];
};

export interface InvalidAction {
  type: string;
  error: string;
  action: SingularAction;
}

export type SingularAction =
  | CreateAction
  | DeleteAction
  | UpdateAction
  | MoveAction
  | AttachAction
  | DetachAction
  | MoveAttachedAction
  | SortAction
  | SortAttachedAction;

export type StateSetterAction<S extends State> = SetStateAction<S>;

export interface BatchAction {
  type: string;
  actions: (SingularAction | InvalidAction)[];
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

export interface SortAction {
  type: string;
  entityType: string;
  compare: Compare;
}

export interface SortAttachedAction {
  type: string;
  entityType: string;
  id: Id;
  relation: string;
  compare: Compare;
}

export interface SetStateAction<S extends State> {
  type: string;
  state: S;
}

//
// action-creator types
//
export type ActionCreators<S extends State> = {
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
  setState: SetStateActionCreator<S>;
};

export type InvalidActionCreator = (action: SingularAction, error: string) => InvalidAction;

export type BatchActionCreator = (
  ...actions: (SingularAction | InvalidAction | BatchAction)[]
) => BatchAction;

export type AttachActionCreator = (
  entityType: string,
  id: Id,
  relation: string,
  attachableId: Id,
  options?: { index?: number; reciprocalIndex?: number }
) => AttachAction | InvalidAction;

export type DetachActionCreator = (
  entityType: string,
  id: Id,
  relation: string,
  detachableId: Id
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
) => SortAction | InvalidAction;

export type SortAttachedActionCreator = <T extends Entity = Entity>(
  entityType: string,
  id: Id,
  relation: string,
  compare: Compare<T>
) => SortAction | InvalidAction;

export type SetStateActionCreator<S extends State> = (state: S) => SetStateAction<S>;

//
// state types
//

export type State = {
  entities: EntitiesByType;
  ids: IdsByType;
};
export type IdsByType = { [type: string]: Id[] };
export type EntitiesByType = { [type: string]: Entities };
export type Entities = { [id in Id]: object };
export type Entity = { [k: string]: any };

//
// schema types
//

export interface Schema {
  [type: string]: EntitySchema;
}

export interface EntitySchema {
  [relationKey: string]: RelationSchema;
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
  getIds: GetIds<S>;
  getEntities: GetEntities<S>;
  getEntity: GetEntity<S>;
}

export interface InternalSelectors<S extends State> {
  getAttached: GetAttached<S>;
  getAllAttachedIds: GetAllAttachedIds<S>;
  getEntityTree: GetEntityTree<S>;
}

export type GetIds<S extends State> = (state: S, args: { type: string }) => Id[];

export type GetEntities<S extends State> = <E extends Entity>(
  state: S,
  args: { type: string }
) => Record<Id, E>;

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
