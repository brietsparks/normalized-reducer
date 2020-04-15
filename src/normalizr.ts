import { EntitiesByType, State, Entities } from './interfaces';

export interface NormalizrOutput {
  entities: EntitiesByType;
}

export const fromNormalizr = <T extends State>(data: NormalizrOutput): T => {
  const { entities: entitiesByType } = data;

  const state: State = {
    entities: {},
    ids: {},
  };

  Object.entries<Entities>(entitiesByType).forEach(([type, entities]) => {
    state.entities[type] = entities;
    state.ids[type] = Object.keys(entities);
  });

  return state as T;
};
