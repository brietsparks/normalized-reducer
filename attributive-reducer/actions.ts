import {
  Namespaced,
  ActionTypes,
  ActionCreators
} from './types';

export const makeActions = <T> (namespaced: Namespaced): { types: ActionTypes, creators: ActionCreators<T> } => {
  const ADD = namespaced('ADD');
  const REMOVE = namespaced('REMOVE');
  const CHANGE = namespaced('CHANGE');
  const MOVE = namespaced('MOVE');


  const add = (id: string, data: T, index?: number) => ({
    type: ADD,
    id,
    data,
    index,
  });

  const remove = (id: string) => ({
    type: REMOVE,
    id
  });

  const change = (id: string, data: T) => ({
    type: ADD,
    id,
    data,
  });

  const move = (id: string, src: number, dest: number) => ({
    type: MOVE,
    id,
    src,
    dest,
  });

  return {
    types: {
      ADD,
      REMOVE,
      CHANGE,
      MOVE
    },
    creators: {
      add,
      remove,
      change,
      move,
    }
  };
};
