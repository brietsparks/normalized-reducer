import { ForumEntities, forumReducer, forumActionCreators, forumEmptyState } from './test-cases/forum';

describe('index', () => {
  describe('add', () => {
    /*
    basic
      if id does not exist, then create the resource
      if id exists, do not create the resource

    with attachables
      rel of one-cardinality
        if attachable resource does not exist, then do nothing
        a single attachable
          set rel value to attachable id
          if no reciprocal rel key on attachable resource, then set key and value
          ignore index
        multiple attachables: overwrite each time

      rel of many-cardinality
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
      describe('rel of one-cardinality', () => {
        test('if attachable resource does not exist, then do nothing', () => {
          const state = {
            ...forumEmptyState,
            account: {
              'a1': { profileId: undefined }
            }
          };

          const result = forumReducer(
            state,
            forumActionCreators.add(ForumEntities.ACCOUNT, 'a1', {}, [{
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
              forumActionCreators.add(ForumEntities.ACCOUNT, 'a1', {}, [{
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
              forumActionCreators.add(ForumEntities.ACCOUNT, 'a1', {}, [{
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
              forumActionCreators.add(ForumEntities.ACCOUNT, 'a1', {}, [{
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
            forumActionCreators.add(ForumEntities.ACCOUNT, 'a1', {}, [
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

      describe('rel of many-cardinality', () => {
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
              forumActionCreators.add(ForumEntities.CATEGORY, 'c200', {}, [
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
              forumActionCreators.add(ForumEntities.CATEGORY, 'c200', {}, [
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
              forumActionCreators.add(ForumEntities.CATEGORY, 'c1', {}, [
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
            forumActionCreators.add(ForumEntities.CATEGORY, 'c200', {}, [
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
    rel of one-cardinality
      set rel value to id
      if no resource rel key, then set key and value
      ignore index

    rel of many-cardinality
      if no index, then append
      if index, then insert
      if no resource rel key, then set key and value,
      if already attached, then do nothing

    if base resource does not exist, then do nothing
    if partially attached (invalid state), then fix the attachment
    */

    describe('rel of one-cardinality', () => {
      test('set rel value to id', () => {
        const state = {
          ...forumEmptyState,
          account: {
            'a1': { profileId: undefined }
          },
          profile: {
            'p1': { accountId: undefined }
          }
        };

        const result = forumReducer(state, forumActionCreators.attach(
          ForumEntities.ACCOUNT,
          'a1',
          'profileId',
          'p1'
        ));

        const expected = {
          ...forumEmptyState,
          account: {
            'a1': { profileId: 'p1' }
          },
          profile: {
            'p1': { accountId: 'a1' }
          }
        };

        expect(result).toEqual(expected);
      });

      test('if no resource rel key, then set key and value', () => {
        const state = {
          ...forumEmptyState,
          account: {
            'a1': {}
          },
          profile: {
            'p1': {}
          }
        };

        const result = forumReducer(state, forumActionCreators.attach(
          ForumEntities.ACCOUNT,
          'a1',
          'profileId',
          'p1'
        ));

        const expected = {
          ...forumEmptyState,
          account: {
            'a1': { profileId: 'p1' }
          },
          profile: {
            'p1': { accountId: 'a1' }
          }
        };

        expect(result).toEqual(expected);
      });

      test('ignore index', () => {
        const state = {
          ...forumEmptyState,
          account: {
            'a1': { profileId: undefined }
          },
          profile: {
            'p1': { accountId: undefined }
          }
        };

        const result = forumReducer(state, forumActionCreators.attach(
          ForumEntities.ACCOUNT,
          'a1',
          'profileId',
          'p1',
          { index: 1, reciprocalIndex: 2 }
        ));

        const expected = {
          ...forumEmptyState,
          account: {
            'a1': { profileId: 'p1' }
          },
          profile: {
            'p1': { accountId: 'a1' }
          }
        };

        expect(result).toEqual(expected);
      });
    });

    describe('rel of many-cardinality', () => {
      test('if no index, then append', () => {
        const state = {
          ...forumEmptyState,
          post: {
            'o1': { categoryIds: ['c1'] }
          },
          category: {
            'c1': { postIds: ['o1'] },
            'c2': { postIds: [] }
          }
        };

        const result = forumReducer(state, forumActionCreators.attach(
          ForumEntities.POST,
          'o1',
          'categoryIds',
          'c2'
        ));

        const expected = {
          ...forumEmptyState,
          post: {
            'o1': { categoryIds: ['c1', 'c2'] }
          },
          category: {
            'c1': { postIds: ['o1'] },
            'c2': { postIds: ['o1'] }
          }
        };

        expect(result).toEqual(expected);
      });

      test('if index, then insert', () => {
        const state = {
          ...forumEmptyState,
          post: {
            'o1': { categoryIds: ['c1', 'c2'] },
          },
          category: {
            'c1': { postIds: ['o1'] },
            'c2': { postIds: ['o1'] },
            'c3': { postIds: [] },
          }
        };

        [
          forumReducer(state, forumActionCreators.attach(
            ForumEntities.POST, 'o1', 'categoryIds', 'c3', { index: 1 }
          )),
          forumReducer(state, forumActionCreators.attach(
            ForumEntities.CATEGORY, 'c3', 'postIds', 'o1', { reciprocalIndex: 1 }
          ))
        ].forEach(result => {
          const expected = {
            ...forumEmptyState,
            post: {
              'o1': { categoryIds: ['c1', 'c3', 'c2'] },
            },
            category: {
              'c1': { postIds: ['o1'] },
              'c2': { postIds: ['o1'] },
              'c3': { postIds: ['o1'] },
            }
          };

          expect(result).toEqual(expected);
        });
      });

      test('if no resource rel key, then set key and value', () => {
        const state = {
          ...forumEmptyState,
          post: {
            'o1': {}
          },
          category: {
            'c1': {},
          }
        };

        const result = forumReducer(state, forumActionCreators.attach(
          ForumEntities.POST,
          'o1',
          'categoryIds',
          'c1'
        ));

        const expected = {
          ...forumEmptyState,
          post: {
            'o1': { categoryIds: ['c1'] }
          },
          category: {
            'c1': { postIds: ['o1'] },
          }
        };

        expect(result).toEqual(expected);
      });

      test('if already attached, then do nothing', () => {
        const state = {
          ...forumEmptyState,
          post: {
            'o1': { categoryIds: ['c1'] }
          },
          category: {
            'c1': { postIds: ['o1'] },
          }
        };

        const result = forumReducer(state, forumActionCreators.attach(
          ForumEntities.POST,
          'o1',
          'categoryIds',
          'c1'
        ));

        expect(result).toEqual(state);
      });
    });

    test('if either resource does not exist, then do nothing', () => {
      const state = {
        ...forumEmptyState,
        account: {
          'a1': { profileId: undefined }
        },
        profile: {
          'p1': { accountId: undefined }
        }
      };

      [
        forumReducer(state, forumActionCreators.attach(
          ForumEntities.ACCOUNT, 'a1', 'profileId', 'p9000'
        )),
        forumReducer(state, forumActionCreators.attach(
          ForumEntities.PROFILE, 'p1', 'accountId', 'a9000'
        )),
      ].forEach(result => expect(result).toEqual(state))
    });

    test('if partially attached (invalid state), then fix the attachment', () => {
      const state = {
        ...forumEmptyState,
        account: {
          'a1': { profileId: 'p1' }
        },
        profile: {
          'p1': { accountId: undefined }
        }
      };

      [
        forumReducer(state, forumActionCreators.attach(
          ForumEntities.ACCOUNT, 'a1', 'profileId', 'p1'
        )),
        forumReducer(state, forumActionCreators.attach(
          ForumEntities.PROFILE, 'p1', 'accountId', 'a1'
        )),
      ].forEach(result => {
        const expected = {
          ...forumEmptyState,
          account: {
            'a1': { profileId: 'p1' }
          },
          profile: {
            'p1': { accountId: 'a1' }
          }
        };

        expect(result).toEqual(expected)
      })
    });
  });

  describe('detach', () => {
    /*
    basic
      one-cardinality
      many-cardinality

    if resource does not exist, then do nothing
    if attachment does not exist then do nothing

    if partially attached (invalid state), then still remove it completely
      when only one resource exists
      when both exist but only one is attached

    */

    describe('basic', () => {
      test('one-cardinality', () => {
        const state = {
          ...forumEmptyState,
          account: {
            'a1': { profileId: 'p1' }
          },
          profile: {
            'p1': { accountId: 'a1' }
          }
        };

        [
          forumReducer(state, forumActionCreators.detach(
            ForumEntities.ACCOUNT, 'a1', 'profileId', 'p1'
          )),
          forumReducer(state, forumActionCreators.detach(
            ForumEntities.PROFILE, 'p1', 'accountId', 'a1'
          )),
        ].forEach(result => {
          const expected = {
            ...forumEmptyState,
            account: {
              'a1': { profileId: undefined }
            },
            profile: {
              'p1': { accountId: undefined }
            }
          };

          expect(result).toEqual(expected);
        });

      });

      test('many-cardinality', () => {
        const state = {
          ...forumEmptyState,
          post: {
            'o1': { categoryIds: ['c1', 'c2', 'c3'] }
          },
          category: {
            'c2': { postIds: ['o1'] }
          }
        };

        const result = forumReducer(state, forumActionCreators.detach(
          ForumEntities.POST,
          'o1',
          'categoryIds',
          'c2'
        ));

        const expected = {
          ...forumEmptyState,
          post: {
            'o1': { categoryIds: ['c1', 'c3'] }
          },
          category: {
            'c2': { postIds: [] }
          }
        };

        expect(result).toEqual(expected);
      });
    });

    test('if resource does not exist, then do nothing', () => {
      const state = {
        ...forumEmptyState,
        account: {
          'a1': { profileId: 'p1' }
        },
        profile: {
          'p1': { accountId: 'a1' }
        }
      };

      [
        forumReducer(state, forumActionCreators.detach(
          ForumEntities.ACCOUNT, 'a9000', 'profileId', 'p1'
        )),
        forumReducer(state, forumActionCreators.detach(
          ForumEntities.PROFILE, 'p9000', 'accountId', 'a1'
        )),
      ].forEach(result => {
        expect(result).toEqual(state);
      });
    });

    test('if attachment does not exist then do nothing', () => {
      const state = {
        ...forumEmptyState,
        account: {
          'a1': { profileId: 'p1' },
          'a200': { profileId: undefined }
        },
        profile: {
          'p1': { accountId: 'a1' }
        }
      };

      [
        forumReducer(state, forumActionCreators.detach(
          ForumEntities.ACCOUNT, 'a200', 'profileId', 'p1'
        )),
        forumReducer(state, forumActionCreators.detach(
          ForumEntities.PROFILE, 'p1', 'accountId', 'a200'
        )),
      ].forEach(result => {
        expect(result).toEqual(state);
      });
    });

    describe('if partially attached (invalid state), then still remove it completely', () => {
      test('when only one resource exists', () => {
        const state = {
          ...forumEmptyState,
          post: {
            'o1': { categoryIds: ['c1'] }
          },
        };

        [
          forumReducer(state, forumActionCreators.detach(
            ForumEntities.POST, 'o1', 'categoryIds', 'c1'
          )),
          forumReducer(state, forumActionCreators.detach(
            ForumEntities.CATEGORY, 'c1', 'postIds', 'o1'
          )),
        ].forEach(result => {
          const expected = {
            ...forumEmptyState,
            post: {
              'o1': { categoryIds: [] }
            },
          };

          expect(result).toEqual(expected);
        });
      });

      test('when both exist but only one is attached', () => {
        const state = {
          ...forumEmptyState,
          post: {
            'o1': { categoryIds: ['c1'] }
          },
          category: {
            'c1': { postIds: [] }
          }
        };

        [
          forumReducer(state, forumActionCreators.detach(
            ForumEntities.POST, 'o1', 'categoryIds', 'c1'
          )),
          forumReducer(state, forumActionCreators.detach(
            ForumEntities.CATEGORY, 'c1', 'postIds', 'o1'
          )),
        ].forEach(result => {
          const expected = {
            ...forumEmptyState,
            post: {
              'o1': { categoryIds: [] }
            },
            category: {
              'c1': { postIds: [] }
            }
          };

          expect(result).toEqual(expected);
        });
      });
    });
  });

  describe('move attached id', () => {
    /*
    move attached id
    if resource does not exist, then ignore
    if resource does not exist or does not have rel key, then ignore
    if resource has cardinality of one, then ignore
    */

    test('move attached id', () => {
      const state = {
        ...forumEmptyState,
        post: {
          'o1': { categoryIds: ['c1', 'c2', 'c3', 'c4', 'c5'] }
        },
        category: {
          'c1': { postIds: ['o1'] },
          'c2': { postIds: ['o1'] },
          'c3': { postIds: ['o1'] },
          'c4': { postIds: ['o1'] },
          'c5': { postIds: ['o1'] },
        }
      };

      const result = forumReducer(state, forumActionCreators.moveAttached(
        ForumEntities.POST,
        'o1',
        'categoryIds',
        1, 3
      ));

      const expected =  {
        ...forumEmptyState,
        post: {
          'o1': { categoryIds: ['c1', 'c3', 'c4', 'c2', 'c5'] }
        },
        category: {
          'c1': { postIds: ['o1'] },
          'c2': { postIds: ['o1'] },
          'c3': { postIds: ['o1'] },
          'c4': { postIds: ['o1'] },
          'c5': { postIds: ['o1'] },
        }
      };

      expect(result).toEqual(expected);
    });

    test('if resource does not exist or does not have rel key, then ignore', () => {
      const state = {
        ...forumEmptyState,
        post: {
          'o1': {}
        }
      };

      [
        forumReducer(state, forumActionCreators.moveAttached(
          ForumEntities.POST, 'o2', 'categoryIds', 1, 3
        )),
        forumReducer(state, forumActionCreators.moveAttached(
          ForumEntities.POST, 'o1', 'categoryIds', 1, 3
        ))
      ].forEach(result => expect(result).toEqual(state));
    });

    test('if rel is cardinality of one, then ignore', () => {
      const state = {
        ...forumEmptyState,
        account: {
          'a1': { profileId: 'p1' }
        },
        profile: {
          'p1': { accountId: 'a1' }
        }
      };

      const result = forumReducer(state, forumActionCreators.moveAttached(
        ForumEntities.ACCOUNT, 'a1', 'profileId', 0, 3
      ));

      expect(result).toEqual(state);
    });
  });

  test('set state', () => {
    const state = {
      ...forumEmptyState,
      account: {
        'a1': { profileId: 'p1' }
      },
      profile: {
        'p1': { accountId: 'a1' }
      }
    };

    const result = forumReducer(undefined, forumActionCreators.setState(state));

    expect(result).toEqual(state);
  });

  test('set entity state', () => {
    [undefined, forumEmptyState].forEach(state => {
      const entityState = {
        'a1': { profileId: 'p1' }
      };

      const result = forumReducer(state, forumActionCreators.setEntityState(
        ForumEntities.ACCOUNT, entityState
      ));

      const expected = {
        ...forumEmptyState,
        account: {
          'a1': { profileId: 'p1' }
        },
      };

      expect(result).toEqual(expected);
    });
  });

  test('set resource state', () => {
    [undefined, forumEmptyState].forEach(state => {
      const resourceState = {
        profileId: 'p200', categoryIds: ['c1']
      };

      const result = forumReducer(state, forumActionCreators.setResourceState(
        ForumEntities.POST, 'o1', resourceState
      ));

      const expected = {
        ...forumEmptyState,
        post: {
          'o1': { profileId: 'p200', categoryIds: ['c1'] }
        }
      };

      expect(result).toEqual(expected);
    });
  });

  test('set rel state', () => {
    [undefined, forumEmptyState].forEach(state => {
      const result = forumReducer(state, forumActionCreators.setRelState(
        ForumEntities.POST, 'o1', 'categoryIds', ['c1']
      ));

      const expected = {
        ...forumEmptyState,
        post: {
          'o1': { categoryIds: ['c1'] }
        }
      };

      expect(result).toEqual(expected);
    });
  });

  test('state setters: if entity is invalid, then ignore', () => {
    [
      forumReducer(forumEmptyState, forumActionCreators.setEntityState(
        'chicken', { 'k1': { profileId: 'p1' } }
      )),
      forumReducer(forumEmptyState, forumActionCreators.setResourceState(
        'chicken', 'k1', { profileId: 'p200', categoryIds: ['c1'] }
      )),
      forumReducer(forumEmptyState, forumActionCreators.setRelState(
        'chicken', 'k1', 'categoryIds', ['c1'],
      )),
    ].forEach(result => expect(result).toEqual(forumEmptyState));
  });

  describe('batched actions', () => {
    describe('basic', () => {
      test('add-actions', () => {
        const result = forumReducer(undefined, forumActionCreators.batch(
          forumActionCreators.add(ForumEntities.ACCOUNT, 'a1'),
          forumActionCreators.add(ForumEntities.ACCOUNT, 'a2'),
        ));

        const expected = {
          ...forumEmptyState,
          account: {
            'a1': { profileId: undefined },
            'a2': { profileId: undefined }
          }
        };

        expect(result).toEqual(expected);
      });

      test('remove-actions', () => {
        const state = {
          ...forumEmptyState,
          account: {
            'a1': {},
            'a2': {},
          }
        };

        const result = forumReducer(state, forumActionCreators.batch(
          forumActionCreators.remove(ForumEntities.ACCOUNT, 'a1'),
          forumActionCreators.remove(ForumEntities.ACCOUNT, 'a2'),
        ));

        expect(result).toEqual(forumEmptyState);
      });

      test('attach-actions', () => {
        const state = {
          ...forumEmptyState,
          account: {
            'a1': {},
          },
          profile: {
            'p1': {},
          },
          post: {
            'o1': {}
          }
        };

        const result = forumReducer(state, forumActionCreators.batch(
          forumActionCreators.attach(ForumEntities.ACCOUNT, 'a1', 'profileId', 'p1'),
          forumActionCreators.attach(ForumEntities.PROFILE, 'p1', 'postIds', 'o1'),
        ));

        const expected = {
          ...forumEmptyState,
          account: {
            'a1': { profileId: 'p1' },
          },
          profile: {
            'p1': { accountId: 'a1', postIds: ['o1'] },
          },
          post: {
            'o1': { profileId: 'p1' }
          }
        };

         expect(result).toEqual(expected);
      });

      test('detach-actions', () => {
        const state = {
          ...forumEmptyState,
          account: {
            'a1': { profileId: 'p1' },
          },
          profile: {
            'p1': { accountId: 'a1', postIds: ['o1'] },
          },
          post: {
            'o1': { profileId: 'p1' },
          }
        };

        const result = forumReducer(state, forumActionCreators.batch(
          forumActionCreators.detach(ForumEntities.ACCOUNT, 'a1', 'profileId', 'p1'),
          forumActionCreators.detach(ForumEntities.PROFILE, 'p1', 'postIds', 'o1'),
        ));

        const expected = {
          ...forumEmptyState,
          account: {
            'a1': { profileId: undefined },
          },
          profile: {
            'p1': { accountId: undefined, postIds: [] },
          },
          post: {
            'o1': { profileId: undefined },
          }
        };

        expect(result).toEqual(expected);
      });

      test('move-attached actions', () => {
        const state = {
          ...forumEmptyState,
          post: {
            'o1': { categoryIds: ['c1', 'c2', 'c3', 'c4', 'c5'] }
          },
          category: {
            'c1': { postIds: ['o1'] },
            'c2': { postIds: ['o1'] },
            'c3': { postIds: ['o1'] },
            'c4': { postIds: ['o1'] },
            'c5': { postIds: ['o1'] },
          }
        };

        const result = forumReducer(state, forumActionCreators.batch(
          forumActionCreators.moveAttached(ForumEntities.POST, 'o1', 'categoryIds', 1, 3),
          forumActionCreators.moveAttached(ForumEntities.POST, 'o1', 'categoryIds', 0, 1),
        ));

        const expected = {
          ...forumEmptyState,
          post: {
            'o1': { categoryIds: ['c3', 'c1', 'c4', 'c2', 'c5'] }
          },
          category: {
            'c1': { postIds: ['o1'] },
            'c2': { postIds: ['o1'] },
            'c3': { postIds: ['o1'] },
            'c4': { postIds: ['o1'] },
            'c5': { postIds: ['o1'] },
          }
        };

        expect(result).toEqual(expected);
      });
    });

    describe('opposing operations negate eachother', () => {
      /*
      remove detaches resources that were attached previously in batch (add and attach)
      */
    });
  });

  describe('actions on self referencing schema', () => {

  });
});
