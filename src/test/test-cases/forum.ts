import {
  Cardinalities,
  EntitySchema,
  AbstractState,
} from '../../types';

import { ModelSchemaReader } from '../../schema';

export enum ForumEntities {
  ACCOUNT = 'account',
  PROFILE = 'profile',
  POST = 'post',
  CATEGORY = 'category',
}

/*

account ---- profile ---< post >--< category

*/

export const accountSchema: EntitySchema = {
  profileId: {
    entity: ForumEntities.PROFILE,
    cardinality: Cardinalities.ONE,
    reciprocal: 'accountId'
  }
};

export const profileSchema = {
  accountId: {
    entity: ForumEntities.ACCOUNT,
    cardinality: Cardinalities.ONE,
    reciprocal: 'profileId'
  },
  postIds: {
    entity: ForumEntities.POST,
    cardinality: Cardinalities.MANY,
    reciprocal: 'profileId'
  }
};

export const postSchema = {
  profileId: {
    entity: ForumEntities.PROFILE,
    cardinality: Cardinalities.ONE,
    reciprocal: 'postIds'
  },
  categoryIds: {
    entity: ForumEntities.CATEGORY,
    cardinality: Cardinalities.MANY,
    reciprocal: 'postIds'
  }
};

export const categorySchema = {
  postIds: {
    entity: ForumEntities.POST,
    cardinality: Cardinalities.MANY,
    reciprocal: 'categoryIds'
  }
};

export interface ForumState extends AbstractState {
  account: {
    [id: string]: {
      profileId: string
    }
  }
  profile: {
    [id: string]: {
      accountId: string,
      postIds: string[],
    }
  }
  post: {
    [id: string]: {
      profileId: string,
      categoryIds: string[],
    }
  }
  category: {
    [id: string]: {
      postIds: string[],
    }
  }
}
