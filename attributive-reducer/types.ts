export interface Action {
  type: string
}

export interface AddAction<T> extends Action {
  id: string,
  data: T,
  index?: number
}

export interface RemoveAction extends Action {
  id: string,
}

export interface ChangeAction<T> extends Action {
  id: string,
  data: T
}

export interface MoveAction extends Action {
  src: number,
  dest: number,
}

export type AddActionCreator <T> = (id: string, data: T, index?: number) => AddAction<T>;
export type RemoveActionCreator = (id: string) => RemoveAction;
export type ChangeActionCreator <T> = (id: string, data: T) => ChangeAction<T>;
export type MoveActionCreator = (id: string, src: number, dest: number) => MoveAction;

export interface ActionTypes {
  ADD: string,
  REMOVE: string,
  CHANGE: string,
  MOVE: string,
}

export interface ActionCreators<T> {
  add: AddActionCreator<T>,
  remove: RemoveActionCreator,
  change: ChangeActionCreator<T>,
  move: MoveActionCreator,
}

export interface State<T> {
  data: Record<string, T>,
  ids: string[]
}

export type Namespaced = (actionType: string) => string;
