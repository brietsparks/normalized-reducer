import { forumActionCreators, forumActionTypes } from '../../src/test-cases';

describe('unit/actions', () => {
  describe('batch', () => {
    it('accepts nested batch actions and returns them flattened in order', () => {
      const action = forumActionCreators.batch(
        forumActionCreators.create('account', 'a1'),
        forumActionCreators.create('account', 'a2'),
        forumActionCreators.batch(
          forumActionCreators.create('account', 'a3'),
          forumActionCreators.create('account', 'a4'),
          forumActionCreators.batch(
            forumActionCreators.create('account', 'a5'),
            forumActionCreators.create('account', 'a6')
          ),
          forumActionCreators.create('account', 'a7'),
          forumActionCreators.create('account', 'a8')
        ),
        forumActionCreators.create('account', 'a9'),
        forumActionCreators.create('account', 'a10')
      );

      const expected = {
        type: forumActionTypes.BATCH,
        actions: [
          { type: forumActionTypes.CREATE, entityType: 'account', id: 'a1', data: {}, index: undefined },
          { type: forumActionTypes.CREATE, entityType: 'account', id: 'a2', data: {}, index: undefined },
          { type: forumActionTypes.CREATE, entityType: 'account', id: 'a3', data: {}, index: undefined },
          { type: forumActionTypes.CREATE, entityType: 'account', id: 'a4', data: {}, index: undefined },
          { type: forumActionTypes.CREATE, entityType: 'account', id: 'a5', data: {}, index: undefined },
          { type: forumActionTypes.CREATE, entityType: 'account', id: 'a6', data: {}, index: undefined },
          { type: forumActionTypes.CREATE, entityType: 'account', id: 'a7', data: {}, index: undefined },
          { type: forumActionTypes.CREATE, entityType: 'account', id: 'a8', data: {}, index: undefined },
          { type: forumActionTypes.CREATE, entityType: 'account', id: 'a9', data: {}, index: undefined },
          { type: forumActionTypes.CREATE, entityType: 'account', id: 'a10', data: {}, index: undefined },
        ],
      };

      expect(action).toEqual(expected);
    });
  });
});
