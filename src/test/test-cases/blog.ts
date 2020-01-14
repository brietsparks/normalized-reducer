import {
  ResourcesByEntityState,
  ModelSchema,
  EntitySchema,
  Cardinalities,
  RelDataState
} from '../../types';
import { makeActions } from '../../actions';
import {
  defaultInvalidEntityHandler,
  defaultInvalidRelHandler,
  defaultInvalidRelDataHandler,
  defaultNonExistentResourceHandler,
  defaultNamespaced,
} from '../../util';
import { ModelSchemaReader } from '../../schema';
import { makeSelectors } from '../../selectors';
import { makeActionTransformer } from '../../middleware';

export enum BlogEntities {
  ARTICLE = 'article',
  AUTHOR = 'author',
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

export interface BlogState extends ResourcesByEntityState {
  resources: {
    author: {
      [id: string]: { articleIds: RelDataState }
    },
    article: {
      [id: string]: { authorId: RelDataState }
    },
  },
  ids: {
    author: string[],
    article: string[],
  }
}

export const blogExampleState: BlogState = {
  resources: {
    author: {
      'a1': { articleIds: ['r1', 'r2'] }
    },
    article: {
      'r1': { authorId: 'a1' },
      'r2': { authorId: 'a1' },
    }
  },
  ids: {
    author: ['a1'],
    article: ['r1', 'r2']
  }
};

export const blogModelSchemaReader = new ModelSchemaReader(blogSchema);

const options = {
  resolveRelFromEntity: false,
  namespaced: defaultNamespaced,
  onInvalidEntity: defaultInvalidEntityHandler,
  onInvalidRel: defaultInvalidRelHandler,
  onInvalidRelData: defaultInvalidRelDataHandler,
  onNonexistentResource: defaultNonExistentResourceHandler,
};

export const {
  creators: blogActionCreators,
  types: blogActionTypes,
} = makeActions(blogModelSchemaReader, options);

export const blogSelectors = makeSelectors(
  blogModelSchemaReader,
  blogActionCreators,
  options,
);

export const transformBlogAction = makeActionTransformer(
  blogModelSchemaReader,
  blogActionTypes,
  blogSelectors,
  options
);
