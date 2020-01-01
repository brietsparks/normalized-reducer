import { makeActions } from './actions';
import { blogModelSchemaReader } from './schema.test';
import { defaultNamespaced, defaultInvalidEntityHandler } from './util';

export const {
  creators: blogActionCreators,
  types: blogActionTypes,
} = makeActions(blogModelSchemaReader, {
  namespaced: defaultNamespaced,
  onInvalidEntity: defaultInvalidEntityHandler,
});

describe('actions', () => {
  describe('makeActions', () => {
    describe('add', () => {
      test('basic', () => {
        const result = blogActionCreators.add('author', 'a1');
        expect(result).toEqual({
          type: blogActionTypes.ADD,
          entity: 'author',
          id: 'a1',
        });
      });

      test('advanced', () => {
        const result = blogActionCreators.add(
          'author',
          'a1',
          [
            {
              rel: 'articleIds',
              id: 'r1'
            },
            {
              rel: 'articleIds',
              id: 'r1',
              index: 1,
              reciprocalIndex: 2,
              options: { createNonexistent: true, displaceAttached: true }
            }
          ],
          { ifExists: 'patch' }
        );

        const expected = {
          type: blogActionTypes.ADD,
          entity: 'author',
          id: 'a1',
          attach: [
            {
              rel: 'articleIds',
              id: 'r1'
            },
            {
              rel: 'articleIds',
              id: 'r1',
              index: 1,
              reciprocalIndex: 2,
              options: { createNonexistent: true, displaceAttached: true }
            }
          ],
          options: { ifExists: 'patch' },
        };

        expect(result).toEqual(expected);
      });
    });
  });
});
