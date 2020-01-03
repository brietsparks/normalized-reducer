import { makeEntityReducer } from '../reducer';

import { blogModelSchemaReader } from './test-cases/blog';
import { AddRelIdOp, OpTypes, RemoveRelIdOp } from '../types';

describe('reducer', () => {
  describe('makeEntityReducer', () => {
    const authorsReducer = makeEntityReducer(blogModelSchemaReader.entity('author'));
    const articlesReducer = makeEntityReducer(blogModelSchemaReader.entity('article'));

    describe('add-resource operation', () => {
      test('if resource already exists', () => {
        const state = {
          'a1': { articleIds: [] }
        };

        const result = authorsReducer(state, [
          {
            opType: OpTypes.ADD_RESOURCE,
            entity: 'author',
            id: 'a1'
          }
        ]);

        expect(result).toEqual(state);
      });

      test('with a many-rel', () => {
        const state = {
          'a1': { articleIds: [] }
        };

        const result = authorsReducer(state, [
          {
            opType: OpTypes.ADD_RESOURCE,
            entity: 'author',
            id: 'a2'
          }
        ]);

        const expected = {
          'a1': { articleIds: [] },
          'a2': { articleIds: [] }
        };

        expect(result).toEqual(expected);
      });

      test('with a one-rel', () => {
        const state = {
          'r1': { authorId: undefined }
        };

        const result = articlesReducer(state, [
          {
            opType: OpTypes.ADD_RESOURCE,
            entity: 'article',
            id: 'r2'
          }
        ]);

        const expected = {
          'r1': { authorId: undefined },
          'r2': { authorId: undefined },
        };

        expect(result).toEqual(expected);
      });
    });

    describe('remove-resource operation', () => {
      test('if resource does not exist', () => {
        const state = {
          'a1': { articleIds: [] }
        };

        const result = authorsReducer(state, [
          {
            opType: OpTypes.REMOVE_RESOURCE,
            entity: 'author',
            id: 'a2'
          }
        ]);

        expect(result).toEqual(state);
      });

      test('if resource does exist', () => {
        const state = {
          'a1': { articleIds: [] },
          'a2': { articleIds: [] }
        };

        const result = authorsReducer(state, [
          {
            opType: OpTypes.REMOVE_RESOURCE,
            entity: 'author',
            id: 'a2'
          }
        ]);

        const expected = {
          'a1': { articleIds: [] }
        };

        expect(result).toEqual(expected);
      });
    });

    describe('add-rel-id operation', () => {
      test('if resource does not exist', () => {
        const state = {
          'a1': { articleIds: [] }
        };

        const result = authorsReducer(state, [
          {
            opType: OpTypes.ADD_REL_ID,
            entity: 'author',
            id: 'a9000',
            rel: 'articleIds',
            relId: 'r1'
          } as AddRelIdOp,
        ]);

        expect(result).toEqual(state);
      });

      test('one cardinality', () => {
        const state = {
          'r1': { authorId: 'a1' }
        };

        const result = articlesReducer(state, [
          {
            opType: OpTypes.ADD_REL_ID,
            entity: 'article',
            id: 'r1',
            rel: 'authorId',
            relId: 'a200'
          } as AddRelIdOp,
        ]);

        const expected = {
          'r1': { authorId: 'a200' }
        };

        expect(result).toEqual(expected);
      });

      describe('many-cardinality', () => {
        test('if missing rel key in state', () => {
          const state = {
            'a1': { }
          };

          const result = authorsReducer(state, [
            {
              opType: OpTypes.ADD_REL_ID,
              entity: 'author',
              id: 'a1',
              rel: 'articleIds',
              relId: 'r200'
            } as AddRelIdOp,
          ]);

          const expected = {
            'a1': { articleIds: ['r200'] }
          };

          expect(result).toEqual(expected);
        });

        test('append', () => {
          const state = {
            'a1': { articleIds: ['r1'] }
          };

          const result = authorsReducer(state, [
            {
              opType: OpTypes.ADD_REL_ID,
              entity: 'author',
              id: 'a1',
              rel: 'articleIds',
              relId: 'r200'
            } as AddRelIdOp,
          ]);

          const expected = {
            'a1': { articleIds: ['r1', 'r200'] }
          };

          expect(result).toEqual(expected);
        });

        test('insert', () => {
          const state = {
            'a1': { articleIds: ['r1', 'r2'] }
          };

          const result = authorsReducer(state, [
            {
              opType: OpTypes.ADD_REL_ID,
              entity: 'author',
              id: 'a1',
              rel: 'articleIds',
              relId: 'r200',
              index: 1
            } as AddRelIdOp,
          ]);

          const expected = {
            'a1': { articleIds: ['r1', 'r200', 'r2'] }
          };

          expect(result).toEqual(expected);
        });
      });

    });

    describe('remove-rel-id operation', () => {
      test('if resource does not exist', () => {
        const state = {
          'a1': { articleIds: [] }
        };

        const result = authorsReducer(state, [
          {
            opType: OpTypes.REMOVE_REL_ID,
            entity: 'author',
            id: 'a2',
            rel: 'articleIds',
            relId: 'r1',
          } as RemoveRelIdOp,
        ]);

        expect(result).toEqual(state);
      });

      test('if resource does not have rel key', () => {
        const state = {
          'a1': { }
        };

        const result = authorsReducer(state, [
          {
            opType: OpTypes.REMOVE_REL_ID,
            entity: 'author',
            id: 'a2',
            rel: 'articleIds',
            relId: 'r1',
          } as RemoveRelIdOp,
        ]);

        expect(result).toEqual(state);
      });

      describe('one-rel', () => {
        test('if op relId is not the existing relId', () => {
          const state = {
            'r1': { authorId: 'a1' }
          };

          const result = articlesReducer(state, [
            {
              opType: OpTypes.REMOVE_REL_ID,
              entity: 'article',
              id: 'r1',
              rel: 'authorId',
              relId: 'a9000',
            } as RemoveRelIdOp,
          ]);

          expect(result).toEqual(state);
        });

        test('basic usage', () => {
          const state = {
            'r1': { authorId: 'a1' }
          };

          const result = articlesReducer(state, [
            {
              opType: OpTypes.REMOVE_REL_ID,
              entity: 'article',
              id: 'r1',
              rel: 'authorId',
              relId: 'a1',
            } as RemoveRelIdOp,
          ]);

          const expected = {
            'r1': { authorId: undefined },
          };

          expect(result).toEqual(expected);
        });
      });

      test('many-rel', () => {
        const state = {
          'a1': { articleIds: ['r1','r2','r3'] }
        };

        const result = authorsReducer(state, [
          {
            opType: OpTypes.REMOVE_REL_ID,
            entity: 'author',
            id: 'a1',
            rel: 'articleIds',
            relId: 'r2',
          } as RemoveRelIdOp,
        ]);

        const expected = {
          'a1': { articleIds: ['r1','r3'] }
        };

        expect(result).toEqual(expected);
      });
    });
  });
});
