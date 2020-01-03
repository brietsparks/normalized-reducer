import makeModule from '..';

import {
  ForumEntities,
  forumSchema,
  ForumState,
} from './test-cases/forum';

describe('index', () => {
  const {
    reducer,
    actionCreators,
    emptyState,
  } = makeModule<ForumState>(forumSchema);

  describe('add', () => {
    describe('basic', () => {
      test('if id does not exist, then create the resource', () => {
        const result = reducer(
          emptyState,
          actionCreators.add(ForumEntities.ACCOUNT, 'a1')
        );

        const expected = {
          ...emptyState,
          account: {
            'a1': { profileId: undefined }
          }
        };

        expect(result).toEqual(expected);
      });

      test('if id exists, then do not create the resource', () => {
        const state = {
          ...emptyState,
          account: {
            'a1': { profileId: undefined }
          }
        };

        const result = reducer(
          state,
          actionCreators.add(ForumEntities.ACCOUNT, 'a1')
        );

        expect(result).toEqual(state);
      });
    });

    describe('with attachables', () => {
      describe('singular rel', () => {
        test('if attachable resource does not exist, then do nothing', () => {
          const state = {
            ...emptyState,
            account: {
              'a1': { profileId: undefined }
            }
          };

          const result = reducer(
            state,
            actionCreators.add(ForumEntities.ACCOUNT, 'a1', [{
              rel: 'profileId',
              id: 'p1'
            }])
          );

          expect(result).toEqual(state);
        });

        describe('one attachable', () => {
          const expected = {
            ...emptyState,
            account: {
              'a1': { profileId: 'p1' }
            },
            profile: {
              'p1': { accountId: 'a1' }
            }
          };

          test('set rel value to attachable id', () => {
            const state = {
              ...emptyState,
              profile: {
                'p1': { accountId: undefined }
              }
            };

            const result = reducer(
              state,
              actionCreators.add(ForumEntities.ACCOUNT, 'a1', [{
                rel: 'profileId',
                id: 'p1'
              }])
            );

            expect(result).toEqual(expected);
          });

          test('if no reciprocal rel key on attachable resource, then set key and value', () => {
            const state = {
              ...emptyState,
              profile: {
                'p1': {}
              }
            };

            const result = reducer(
              state,
              actionCreators.add(ForumEntities.ACCOUNT, 'a1', [{
                rel: 'profileId',
                id: 'p1'
              }])
            );

            expect(result).toEqual(expected);
          });

          test('ignore index', () => {
            const state = {
              ...emptyState,
              profile: {
                'p1': { accountId: undefined }
              }
            };

            const result = reducer(
              state,
              actionCreators.add(ForumEntities.ACCOUNT, 'a1', [{
                rel: 'profileId',
                id: 'p1',
                index: 3,
                reciprocalIndex: 2, // reciprocal happens to be cardinality of one in this test
              }])
            );

            expect(result).toEqual(expected);
          });
        });

        test('more than one attachable: overwrite each time', () => {
          const state = {
            ...emptyState,
            profile: {
              'p1': { accountId: undefined },
              'p2': { accountId: undefined },
            }
          };

          const result = reducer(
            state,
            actionCreators.add(ForumEntities.ACCOUNT, 'a1', [
              { rel: 'profileId', id: 'p1' },
              { rel: 'profileId', id: 'p2' }
            ])
          );

          const expected = {
            ...emptyState,
            account: {
              'a1': { profileId: 'p2' }
            },
            profile: {
              'p1': { accountId: undefined },
              'p2': { accountId: 'a1' },
            }
          };

          expect(result).toEqual(expected);
        });
      });
    });

    /*
    basic
      if id does not exist, then create the resource
      if id exists, do not create the resource

    with attachables
      singular rel
        if attachable resource does not exist, then do nothing
        one attachable
          set rel value to attachable id
          if no reciprocal rel key on attachable resource, then set key and value
          ignore index
        more than one attachable: overwrite each time

      plural rel
        one attachable
          if no index, then append
          if index, then insert
          if no resource rel key, then set key and value

        more than one attachable:
          append/insert each
      reciprocal plural rel: same prev

      attachable resource does not exist
        when createNonexistent is false, then do nothing
        when createNonexistent is true, then create attachable

    */
  });

  describe('remove', () => {
    /*
    without attached
      if id exists, then remove resource
      if id does not exist, then do nothing

    with attached: detach from all related resources
    */
  });

  describe('attach', () => {
    /*
    singular rel
      set rel value to id
      if no resource rel key, then set key and value
      ignore index
    reciprocal singular rel: same prev

    plural rel
      if no index, then append
      if index, then insert
      if no resource rel key, then set key and value
    reciprocal plural rel: same prev
    */
  });

  describe('detach', () => {
    /*
    if resource does not exist, then do nothing
    if invalid attachment state, then remove the remaining rel id
      when only one resource exists
      when both exist but only one is attached
    if attachment does not exist then do nothing
    */
  });

  describe('batched actions', () => {
    // test that opposing actions negate each other's effects
  });
});
