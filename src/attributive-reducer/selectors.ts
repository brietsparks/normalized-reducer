import { State } from './types';

export const makeSelectors = <T>() => {
  const getIds = (state: State<T>) => state.ids;
  const getAllData = (state: State<T>) => state.data;
  const getDataById = (state: State<T>, args: { id: string }) => state.data[args.id]
};
