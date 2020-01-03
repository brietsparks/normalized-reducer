import { ForumEntities, forumReducer, forumActionCreators, forumEmptyState } from './test-cases/forum';

describe('index', () => {
  describe('add', () => {
    /*
    basic
      if id does not exist, then create the resource
      if id exists, do not create the resource

    with attachables
      rel of cardinality of one
        if attachable resource does not exist, then do nothing
        a single attachable
          set rel value to attachable id
          if no reciprocal rel key on attachable resource, then set key and value
          ignore index
        multiple attachables: overwrite each time

      rel of cardinality of many
        a single attachable
          if no reciprocal index, then append to attachable
          if reciprocal index, then insert in attachable
          if no reciprocal rel key on attachable resource, then set key and value
        multiple attachables: append/insert each
    */

    describe('basic', () => {
      test('if id does not exist, then create the resource', () => {
        const result = forumReducer(
          forumEmptyState,
          forumActionCreators.add(ForumEntities.ACCOUNT, 'a1')
        );

        const expected = {
          ...forumEmptyState,
          account: {
            'a1': { profileId: undefined }
          }
        };

        expect(result).toEqual(expected);
      });

      test('if id exists, then do not create the resource', () => {
        const state = {
          ...forumEmptyState,
          account: {
            'a1': { profileId: undefined }
          }
        };

        const result = forumReducer(
          state,
          forumActionCreators.add(ForumEntities.ACCOUNT, 'a1')
        );

        expect(result).toEqual(state);
      });
    });

    describe('with attachables', () => {
      describe('rel of cardinality of one', () => {
        test('if attachable resource does not exist, then do nothing', () => {
          const state = {
            ...forumEmptyState,
            account: {
              'a1': { profileId: undefined }
            }
          };

          const result = forumReducer(
            state,
            forumActionCreators.add(ForumEntities.ACCOUNT, 'a1', [{
              rel: 'profileId',
              id: 'p1'
            }])
          );

          expect(result).toEqual(state);
        });

        describe('a single attachable', () => {
          const expected = {
            ...forumEmptyState,
            account: {
              'a1': { profileId: 'p1' }
            },
            profile: {
              'p1': { accountId: 'a1' }
            }
          };

          test('set rel value to attachable id', () => {
            const state = {
              ...forumEmptyState,
              profile: {
                'p1': { accountId: undefined }
              }
            };

            const result = forumReducer(
              state,
              forumActionCreators.add(ForumEntities.ACCOUNT, 'a1', [{
                rel: 'profileId',
                id: 'p1'
              }])
            );

            expect(result).toEqual(expected);
          });

          test('if no reciprocal rel key on attachable resource, then set key and value', () => {
            const state = {
              ...forumEmptyState,
              profile: {
                'p1': {}
              }
            };

            const result = forumReducer(
              state,
              forumActionCreators.add(ForumEntities.ACCOUNT, 'a1', [{
                rel: 'profileId',
                id: 'p1'
              }])
            );

            expect(result).toEqual(expected);
          });

          test('ignore index', () => {
            const state = {
              ...forumEmptyState,
              profile: {
                'p1': { accountId: undefined }
              }
            };

            const result = forumReducer(
              state,
              forumActionCreators.add(ForumEntities.ACCOUNT, 'a1', [{
                rel: 'profileId',
                id: 'p1',
                index: 3,
                reciprocalIndex: 2, // reciprocal happens to be cardinality of one in this test
              }])
            );

            expect(result).toEqual(expected);
          });
        });

        test('multiple attachables: overwrite each time', () => {
          const state = {
            ...forumEmptyState,
            profile: {
              'p1': { accountId: undefined },
              'p2': { accountId: undefined },
            }
          };

          const result = forumReducer(
            state,
            forumActionCreators.add(ForumEntities.ACCOUNT, 'a1', [
              { rel: 'profileId', id: 'p1' },
              { rel: 'profileId', id: 'p2' }
            ])
          );

          const expected = {
            ...forumEmptyState,
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

      describe('rel of cardinality of many', () => {
        describe('a single attachable', () => {
          test('if no reciprocal index, then append to attachable', () => {
            const state = {
              ...forumEmptyState,
              post: {
                'o1': {
                  profileId: undefined,
                  categoryIds: ['c1']
                }
              },
              category: {
                'c1': { postIds: ['o1'] }
              }
            };

            const result = forumReducer(
              state,
              forumActionCreators.add(ForumEntities.CATEGORY, 'c200', [
                { rel: 'postIds', id: 'o1' },
              ])
            );

            const expected = {
              ...forumEmptyState,
              post: {
                'o1': {
                  profileId: undefined,
                  categoryIds: ['c1','c200']
                }
              },
              category: {
                'c1': { postIds: ['o1'] },
                'c200': { postIds: ['o1'] }
              }
            };

            expect(result).toEqual(expected);
          });

          test('if reciprocal index, then insert in attachable', () => {
            const state = {
              ...forumEmptyState,
              post: {
                'o1': {
                  profileId: undefined,
                  categoryIds: ['c1','c2']
                }
              },
              category: {
                'c1': { postIds: ['o1'] },
                'c2': { postIds: ['o1'] }
              }
            };

            const result = forumReducer(
              state,
              forumActionCreators.add(ForumEntities.CATEGORY, 'c200', [
                { rel: 'postIds', id: 'o1', reciprocalIndex: 1 },
              ])
            );

            const expected = {
              ...forumEmptyState,
              post: {
                'o1': {
                  profileId: undefined,
                  categoryIds: ['c1', 'c200', 'c2']
                }
              },
              category: {
                'c1': { postIds: ['o1'] },
                'c2': { postIds: ['o1'] },
                'c200': { postIds: ['o1'] }
              }
            };

            expect(result).toEqual(expected);
          });

          test('if no reciprocal rel key on attachable resource, then set key and value', () => {
            const state = {
              ...forumEmptyState,
              post: {
                'o1': {
                  profileId: undefined,
                }
              },
            };

            const result = forumReducer(
              state,
              forumActionCreators.add(ForumEntities.CATEGORY, 'c1', [
                { rel: 'postIds', id: 'o1' },
              ])
            );

            const expected = {
              ...forumEmptyState,
              post: {
                'o1': {
                  profileId: undefined,
                  categoryIds: ['c1']
                }
              },
              category: {
                'c1': { postIds: ['o1'] },
              }
            };

            expect(result).toEqual(expected);
          });
        });

        test('multiple attachables: append/insert each', () => {
          const state = {
            ...forumEmptyState,
            post: {
              'o1': {
                profileId: undefined,
                categoryIds: []
              },
              'o2': {
                profileId: undefined,
                categoryIds: ['c1', 'c2']
              }
            },
            category: {
              'c1': { postIds: ['o2'] },
              'c2': { postIds: ['o2'] }
            }
          };

          const result = forumReducer(
            state,
            forumActionCreators.add(ForumEntities.CATEGORY, 'c200', [
              { rel: 'postIds', id: 'o1', index: 1, },
              { rel: 'postIds', id: 'o2', index: 0, reciprocalIndex: 1 },
            ])
          );

          const expected = {
            ...forumEmptyState,
            post: {
              'o1': {
                profileId: undefined,
                categoryIds: ['c200']
              },
              'o2': {
                profileId: undefined,
                categoryIds: ['c1', 'c200', 'c2']
              }
            },
            category: {
              'c1': { postIds: ['o2'] },
              'c2': { postIds: ['o2'] },
              'c200': { postIds: ['o2', 'o1'] }
            }
          };

          expect(result).toEqual(expected);
        });
      });
    });
  });

  describe('remove', () => {
    /*
    without attached
      if id exists, then remove resource
      if id does not exist, then do nothing

    detach all existing attached resources
      detach resource of reciprocal one-cardinality
      detach resource of reciprocal many-cardinality
    */

    describe('without attached', () => {
      const state = {
        ...forumEmptyState,
        account: {
          'a1': { profileId: undefined }
        }
      };

      test('if id exists, then remove resource', () => {
        const result = forumReducer(
          state,
          forumActionCreators.remove(ForumEntities.ACCOUNT, 'a1')
        );

        expect(result).toEqual(forumEmptyState);
      });

      test('if id does not exist, then do nothing', () => {
        const result = forumReducer(
          state,
          forumActionCreators.remove(ForumEntities.ACCOUNT, 'a9000')
        );

        expect(result).toEqual(state);
      });
    });

    describe('detach all existing attached resources', () => {
      test('detach resource of reciprocal one-cardinality', () => {
        const state = {
          ...forumEmptyState,
          account: {
            a1: { profileId: 'p1' }
          },
          profile: {
            p1: {
              accountId: 'a1',
              postIds: ['o1', 'o2']
            }
          },
          post: {
            o1: { profileId: 'p1', categoryIds: [] },
            o2: { profileId: 'p1', categoryIds: [] },
          }
        };

        const result = forumReducer(
          state,
          forumActionCreators.remove(ForumEntities.PROFILE, 'p1')
        );

        const expected = {
          ...forumEmptyState,
          account: {
            a1: { profileId: undefined }
          },
          post: {
            o1: {
              profileId: undefined,
              categoryIds: [],
            },
            o2: {
              profileId: undefined,
              categoryIds: [],
            },
          }
        };

        expect(result).toEqual(expected);
      });

      test('detach resource of reciprocal many-cardinality', () => {
        const state = {
          ...forumEmptyState,
          profile: {
            p1: { postIds: ['o1', 'o2', 'o3'] }
          },
          post: {
            o1: { profileId: 'p1', categoryIds: [] },
            o2: { profileId: 'p1', categoryIds: ['c1'] },
            o3: { profileId: 'p1', categoryIds: [] },
          },
          category: {
            c1: { postIds: ['o2'] }
          }
        };

        const result = forumReducer(
          state,
          forumActionCreators.remove(ForumEntities.POST, 'o2')
        );

        const expected = {
          ...forumEmptyState,
          profile: {
            p1: { postIds: ['o1', 'o3'] }
          },
          post: {
            o1: { profileId: 'p1', categoryIds: [] },
            o3: { profileId: 'p1', categoryIds: [] },
          },
          category: {
            c1: { postIds: [] }
          }
        };

        expect(result).toEqual(expected);
      });
    });
  });

  describe('attach', () => {
    /*
    rel of cardinality of one
      set rel value to id
      if no resource rel key, then set key and value
      ignore index
    reciprocal rel of cardinality of one: same prev

    rel of cardinality of many
      if no index, then append
      if index, then insert
      if no resource rel key, then set key and value
    reciprocal rel of cardinality of many: same prev
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

    /*

    remove detaches resources that were attached previously in batch (add and attach)

    */
  });
});
