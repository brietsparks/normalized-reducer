import { Cardinalities } from './enums';

export type Id = string | number;

export type Namespaced = (actionType: string) => string;

export interface AnyAction {
  type: string;
}

export interface ActionTypes {
  INVALID: string;
  BATCH: string;
  CREATE: string;
  DELETE: string;
  // UPDATE: string;
  // MOVE: string;
  ATTACH: string;
  DETACH: string;
  // MOVE_ATTACHED: string;
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
  deletionSchema?: SelectorTreeSchema;
}

export interface UpdateAction {
  type: string;
  entityType: string;
  id: Id;
  data: object;
  options: { partial?: boolean };
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
  relation: string;
  src: number;
  dest: number;
}

export interface SetState {
  type: string;
}

//
// action-creator types
//
export type ActionCreators = {
  attach: AttachActionCreator;
  detach: DetachActionCreator;
  delete: DeleteActionCreator;
  create: CreateActionCreator;
};

export type InvalidActionCreator = (action: ValidAction, error: string) => InvalidAction;

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
  deletionSchema?: SelectorTreeSchema
) => DeleteAction | InvalidAction;

export type CreateActionCreator = (
  entityType: string,
  id: Id,
  data?: object,
  index?: number
) => CreateAction | InvalidAction;

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
export type EntityTreeNode = { id: Id; type: string; entity: object };
