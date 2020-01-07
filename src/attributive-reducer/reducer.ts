import { Action, ActionTypes, AddAction, ChangeAction, MoveAction, RemoveAction, State } from './types';
import { arrayPut, arrayMove } from '../util';

export const makeReducer = <T>(actionTypes: ActionTypes) => {
  const dataReducer = <T>(state: Record<string, T> = {}, action: Action) => {
    if (action.type === actionTypes.ADD) {
      const { id, data } = action as AddAction<T>;
      return {
        ...state,
        [id]: data
      };
    }

    if (action.type === actionTypes.REMOVE) {
      const { id } = action as RemoveAction;
      const newState = { ...state };
      delete newState[id];
      return newState;
    }

    if (action.type === actionTypes.CHANGE) {
      const { id, data } = action as ChangeAction<T>;
      return {
        ...state,
        [id]: { ...state[id], ...data }
      };
    }

    return state;
  };

  const idsReducer = (state: string[] = [], action: Action) => {
    if (action.type === actionTypes.ADD) {
      const { id, index } = action as AddAction<T>;
      const newState = [...state];
      return arrayPut<string>(newState, id, index);
    }

    if (action.type === actionTypes.REMOVE) {
      const { id } = action as RemoveAction;
      return state.filter(existingId => existingId !== id);
    }

    if (action.type === actionTypes.MOVE) {
      const { src, dest } = action as MoveAction;
      const newState = [...state];
      return arrayMove(newState, src, dest);
    }

    return state;
  };

  return (state: State<T>, action: Action) => ({
    data: dataReducer<T>(state.data, action),
    ids: idsReducer(state.ids, action),
  });
};
