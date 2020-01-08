import { makeActionTransformer } from '../middleware';

import { blogActionTypes, blogState, BlogState, transformBlogAction } from './test-cases/blog';
import { AddAction, OpTypes } from '../types';

describe('middleware', () => {
  describe('makeActionTransformer', () => {

    describe('add action', () => {
      test('already existing resource', () => {
        const action: AddAction = {
          type: blogActionTypes.ADD,
          entity: 'author',
          id: 'a1',
        };

        const result = transformBlogAction(blogState, action);

        const expected = {
          ...action,
          ops: []
        };

        expect(result).toEqual(expected);
      });

      test('basic', () => {
        const action: AddAction = {
          type: blogActionTypes.ADD,
          entity: 'author',
          id: 'a200',
        };

        const result = transformBlogAction(blogState, action);

        const expected = {
          ...action,
          ops: [
            {
              opType: OpTypes.ADD_RESOURCE,
              entity: 'author', id: 'a200'
            }
          ]
        };

        expect(result).toEqual(expected);
      });

      test('with attached', () => {
        const state: BlogState = {
          resources: {
            author: {
              'a1': { articleIds: [] }
            },
            article: {
              'r1': { authorId: undefined },
              'r2': { authorId: undefined },
            }
          },
          ids: {
            author: ['a1'],
            article: ['r1', 'r2']
          }
        };

        const action: AddAction = {
          type: blogActionTypes.ADD,
          entity: 'author',
          id: 'a200',
          attach: [
            { rel: 'articleIds', id: 'r1' },
            { rel: 'articleIds', id: 'r2' }
          ]
        };

        const result = transformBlogAction(state, action);

        const expected = {
          ...action,
          ops: [
            {
              opType: OpTypes.ADD_RESOURCE,
              entity: 'author', id: 'a200'
            },
            {
              opType: OpTypes.ADD_REL_ID,
              entity: 'author', id: 'a200',
              rel: 'articleIds', relId: 'r1'
            },
            {
              opType: OpTypes.ADD_REL_ID,
              entity: 'article', id: 'r1',
              rel: 'authorId', relId: 'a200'
            },
            {
              opType: OpTypes.ADD_REL_ID,
              entity: 'author', id: 'a200',
              rel: 'articleIds', relId: 'r2'
            },
            {
              opType: OpTypes.ADD_REL_ID,
              entity: 'article', id: 'r2',
              rel: 'authorId', relId: 'a200'
            },
          ]
        };

        expect(result).toEqual(expected);
      });

      test('with attached displacing existing attached', () => {
        const state: BlogState = {
          resources: {
            author: {
              'a1': { articleIds: ['r1'] },
              'a2': { articleIds: ['r2'] },
            },
            article: {
              'r1': { authorId: 'a1' },
              'r2': { authorId: 'a2' },
            }
          },
          ids: {
            author: ['a1', 'a2'],
            article: ['r1', 'r2']
          }
        };

        const action: AddAction = {
          type: blogActionTypes.ADD,
          entity: 'author',
          id: 'a200',
          attach: [
            { rel: 'articleIds', id: 'r1' },
            { rel: 'articleIds', id: 'r2' }
          ]
        };

        const result = transformBlogAction(state, action);

        const expected = {
          ...action,
          ops: [
            {
              opType: OpTypes.ADD_RESOURCE,
              entity: 'author', id: 'a200'
            },
            {
              opType: OpTypes.REMOVE_REL_ID,
              entity: 'author', id: 'a1',
              rel: 'articleIds', relId: 'r1',
            },
            {
              opType: OpTypes.ADD_REL_ID,
              entity: 'author', id: 'a200',
              rel: 'articleIds', relId: 'r1'
            },
            {
              opType: OpTypes.ADD_REL_ID,
              entity: 'article', id: 'r1',
              rel: 'authorId', relId: 'a200'
            },
            {
              opType: OpTypes.REMOVE_REL_ID,
              entity: 'author', id: 'a2',
              rel: 'articleIds', relId: 'r2',
            },
            {
              opType: OpTypes.ADD_REL_ID,
              entity: 'author', id: 'a200',
              rel: 'articleIds', relId: 'r2'
            },
            {
              opType: OpTypes.ADD_REL_ID,
              entity: 'article', id: 'r2',
              rel: 'authorId', relId: 'a200'
            },
          ]
        };

        expect(result).toEqual(expected);
      });
    });


  });
});
