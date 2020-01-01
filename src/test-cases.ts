import {
  AbstractState,
  ModelSchema,
  EntitySchema,
  Cardinalities,
  AbstractEntityState,
  AbstractRelDataState
} from './types';

export enum BlogEntities {
  AUTHOR = 'author',
  ARTICLE = 'article'
}

export const authorSchema: EntitySchema = {
  articleIds: {
    cardinality: Cardinalities.MANY,
    entity: BlogEntities.ARTICLE,
    reciprocal: 'authorId'
  },
};

export const articleSchema: EntitySchema = {
  authorId: {
    cardinality: Cardinalities.ONE,
    entity: BlogEntities.AUTHOR,
    reciprocal: 'articleIds'
  }
};

export const blogSchema: ModelSchema = {
  [BlogEntities.AUTHOR]: authorSchema,
  [BlogEntities.ARTICLE]: articleSchema,
};

export interface BlogState extends AbstractState {
  author: {
    [id: string]: { articleIds: AbstractRelDataState }
  },
  article: {
    [id: string]: { authorId: AbstractRelDataState }
  },
}

export const blogState: BlogState = {
  author: {
    'a1': { articleIds: ['r1', 'r2'] }
  },
  article: {
    'r1': { authorId: 'a1' },
    'r2': { authorId: 'a1' },
  }
};
