import { blogActionCreators, blogActionTypes } from './test-cases/blog';

describe('actions', () => {
  describe('makeActions', () => {
    describe('add', () => {
      test('basic', () => {
        const result = blogActionCreators.add('author', 'a1');
        expect(result).toEqual({
          type: blogActionTypes.ADD,
          entity: 'author',
          id: 'a1',
          data: {},
        });
      });

      test('advanced', () => {
        const result = blogActionCreators.add(
          'author',
          'a1',
          { name: 'Jar Jar', articleIds: ['bad data!'] },
          [
            {
              rel: 'articleIds',
              id: 'r1',
            },
            {
              rel: 'articleIds',
              id: 'r1',
              index: 1,
              reciprocalIndex: 2,
            },
          ]
        );

        const expected = {
          type: blogActionTypes.ADD,
          entity: 'author',
          id: 'a1',
          data: { name: 'Jar Jar' },
          attach: [
            {
              rel: 'articleIds',
              id: 'r1',
            },
            {
              rel: 'articleIds',
              id: 'r1',
              index: 1,
              reciprocalIndex: 2,
            },
          ],
        };

        expect(result).toEqual(expected);
      });
    });
  });
});
