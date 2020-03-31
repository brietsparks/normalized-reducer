import makeModule, { Id, ModelSchema } from './index';
import { ModelSchemaReader } from './schema';
import { makeSelectors } from './selectors';

export enum ForumEntities {
  ACCOUNT = 'account',
  PROFILE = 'profile',
  POST = 'post',
  CATEGORY = 'category',
  TAG = 'tag',
}

export type Account = {
  profileId: string;
};

export type Profile = {
  // relational
  accountId: string;
  postIds: string[];

  // non-relational
  firstName: string;
  lastName: string;
};

export type Post = {
  // relational
  profileId: string;
  categoryIds: string[];
  tagIds: string[];
  parentId: string;
  childIds: string[];

  // non-relational
  title: string;
  body: string;
};

export type Category = {
  // relational
  postIds: string[];

  // non-relational
  name: string;
};

export type Tag = {
  // relational
  postIds: string[];

  // non-relational
  value: string;
};

export type ForumState = {
  entities: {
    account: Record<Id, Partial<Account>>;
    profile: Record<Id, Partial<Profile>>;
    post: Record<Id, Partial<Post>>;
    category: Record<Id, Partial<Category>>;
    tag: Record<Id, Partial<Tag>>;
  };
  ids: {
    account: Id[];
    profile: Id[];
    post: Id[];
    category: Id[];
    tag: Id[];
  };
};

/*

account ---- profile ---< post >--< category
                               >--< tag

*/

export const forumSchema: ModelSchema = {
  account: {
    profileId: {
      type: ForumEntities.PROFILE,
      cardinality: 'one',
      reciprocal: 'accountId',
    },
  },
  profile: {
    accountId: {
      type: ForumEntities.ACCOUNT,
      cardinality: 'one',
      reciprocal: 'profileId',
    },
    postIds: {
      type: ForumEntities.POST,
      cardinality: 'many',
      reciprocal: 'profileId',
    },
  },
  post: {
    profileId: {
      type: ForumEntities.PROFILE,
      cardinality: 'one',
      reciprocal: 'postIds',
    },
    categoryIds: {
      type: ForumEntities.CATEGORY,
      cardinality: 'many',
      reciprocal: 'postIds',
    },
    tagIds: {
      type: ForumEntities.TAG,
      cardinality: 'many',
      reciprocal: 'postIds',
    },
    parentId: {
      type: ForumEntities.POST,
      cardinality: 'one',
      reciprocal: 'childIds',
    },
    childIds: {
      type: ForumEntities.POST,
      cardinality: 'many',
      reciprocal: 'parentId',
    },
  },
  category: {
    postIds: {
      type: ForumEntities.POST,
      cardinality: 'many',
      reciprocal: 'categoryIds',
    },
  },
  tag: {
    postIds: {
      type: ForumEntities.POST,
      cardinality: 'many',
      reciprocal: 'tagIds',
    },
  },
};

export const forumModelSchemaReader = new ModelSchemaReader(forumSchema);

export const {
  emptyState: forumEmptyState,
  actionCreators: forumActionCreators,
  reducer: forumReducer,
  selectors: forumSelectors,
  actionTypes: forumActionTypes,
} = makeModule<ForumState>(forumSchema);

export const allForumSelectors = makeSelectors<ForumState>(forumModelSchemaReader);
