import { Cardinalities, State } from '../../src';

import makeModule from '../../src/index';
import { ModelSchemaReader } from '../../src/schema';

export enum ForumEntities {
  ACCOUNT = 'account',
  PROFILE = 'profile',
  POST = 'post',
  CATEGORY = 'category',
  TAG = 'tag',
}

/*

account ---- profile ---< post >--< category
                               >--< tag

*/

export const forumSchema = {
  account: {
    profileId: {
      entity: ForumEntities.PROFILE,
      cardinality: Cardinalities.ONE,
      reciprocal: 'accountId',
    },
  },
  profile: {
    accountId: {
      entity: ForumEntities.ACCOUNT,
      cardinality: Cardinalities.ONE,
      reciprocal: 'profileId',
    },
    postIds: {
      entity: ForumEntities.POST,
      cardinality: Cardinalities.MANY,
      reciprocal: 'profileId',
    },
  },
  post: {
    profileId: {
      entity: ForumEntities.PROFILE,
      cardinality: Cardinalities.ONE,
      reciprocal: 'postIds',
    },
    categoryIds: {
      entity: ForumEntities.CATEGORY,
      cardinality: Cardinalities.MANY,
      reciprocal: 'postIds',
    },
    tagIds: {
      entity: ForumEntities.TAG,
      cardinality: Cardinalities.MANY,
      reciprocal: 'postIds',
    },
    parentId: {
      entity: ForumEntities.POST,
      cardinality: Cardinalities.ONE,
      reciprocal: 'childIds',
    },
    childIds: {
      entity: ForumEntities.POST,
      cardinality: Cardinalities.MANY,
      reciprocal: 'parentId',
    },
  },
  category: {
    postIds: {
      entity: ForumEntities.POST,
      cardinality: Cardinalities.MANY,
      reciprocal: 'categoryIds',
    },
  },
  tag: {
    postIds: {
      entity: ForumEntities.POST,
      cardinality: Cardinalities.MANY,
      reciprocal: 'tagIds',
    },
  },
};

export interface ForumState extends State {
  resources: {
    account: {
      [id: string]: {
        profileId?: string;
      };
    };
    profile: {
      [id: string]: {
        accountId?: string;
        postIds?: string[];
      };
    };
    post: {
      [id: string]: {
        profileId?: string;
        categoryIds?: string[];
        tagIds?: string[];
        parentId?: string;
        childIds?: string[];
      };
    };
    category: {
      [id: string]: {
        postIds?: string[];
      };
    };
    tag: {
      [id: string]: {
        postIds?: string[];
      };
    };
  };
  ids: {
    account: string[];
    profile: string[];
    post: string[];
    category: string[];
    tag: string[];
  };
}

export const forumModelSchemaReader = new ModelSchemaReader(forumSchema);

export const {
  emptyState: forumEmptyState,
  actionCreators: forumActionCreators,
  reducer: forumReducer,
  transformAction: forumTransformAction,
  selectors: forumSelectors,
  actionTypes: forumActionTypes,
} = makeModule<ForumState>(forumSchema, { resolveRelFromEntity: true });
