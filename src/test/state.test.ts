import { PendingState } from '../state';

import { BlogState, blogExampleState, blogModelSchemaReader, blogSelectors } from './test-cases/blog';
import { makeAddRelIdOp, makeRemoveRelIdOp } from '../ops';

describe('pendingState', () => {
  test('add-resource-op', () => {
    const pendingState = new PendingState(blogModelSchemaReader, blogExampleState, blogSelectors);
    // current state
    expect(pendingState.checkExistence('author', 'a1')).toEqual(true);
    expect(pendingState.checkExistence('article', 'r1')).toEqual(true);

    // modify the cache
    expect(pendingState.checkExistence('author', 'a9000')).toEqual(false);
    pendingState.addResource('author', 'a9000', {});
    expect(pendingState.checkExistence('author', 'a9000')).toEqual(true);
  });

  describe('attach/detach resources', () => {
    test('detach then attach', () => {
      const pendingState = new PendingState(blogModelSchemaReader, blogExampleState, blogSelectors);

      //
      // detach
      //
      pendingState.detachResources('author', 'a1', 'articleIds', 'r1');

      expect(pendingState.getOps()).toEqual([
        makeRemoveRelIdOp('author', 'a1', 'articleIds', 'r1'),
        makeRemoveRelIdOp('article', 'r1', 'authorId', 'a1'),
      ]);

      pendingState.detachResources('article', 'r2', 'authorId', 'a1');
      expect(pendingState.getOps()).toEqual([
        makeRemoveRelIdOp('author', 'a1', 'articleIds', 'r1'),
        makeRemoveRelIdOp('article', 'r1', 'authorId', 'a1'),
        makeRemoveRelIdOp('article', 'r2', 'authorId', 'a1'),
        makeRemoveRelIdOp('author', 'a1', 'articleIds', 'r2'),
      ]);

      //
      // detach
      //
      pendingState.attachResources('author', 'a1', 'articleIds', 'r1');
      expect(pendingState.getOps()).toEqual([
        makeRemoveRelIdOp('article', 'r2', 'authorId', 'a1'),
        makeRemoveRelIdOp('author', 'a1', 'articleIds', 'r2'),
        makeAddRelIdOp('author', 'a1', 'articleIds', 'r1'),
        makeAddRelIdOp('article', 'r1', 'authorId', 'a1'),
      ]);
    });

    test('attach then detach', () => {
      const blogState: BlogState = {
        resources: {
          author: {
            'a1': { articleIds: [] }
          },
          article: {
            'r1': { authorId: undefined },
            'r2': { authorId: undefined },
          },
        },
        ids: {
          author: ['a1'],
          article: ['r1', 'r2']
        }
      };

      const pendingState = new PendingState(blogModelSchemaReader, blogState, blogSelectors);

      //
      // attach
      //
      pendingState.attachResources('author', 'a1', 'articleIds', 'r1');
      expect(pendingState.getOps()).toEqual([
        makeAddRelIdOp('author', 'a1', 'articleIds', 'r1'),
        makeAddRelIdOp('article', 'r1', 'authorId', 'a1')
      ]);

      pendingState.attachResources('article', 'r2', 'authorId', 'a1');
      expect(pendingState.getOps()).toEqual([
        makeAddRelIdOp('author', 'a1', 'articleIds', 'r1'),
        makeAddRelIdOp('article', 'r1', 'authorId', 'a1'),
        makeAddRelIdOp('article', 'r2', 'authorId', 'a1'),
        makeAddRelIdOp('author', 'a1', 'articleIds', 'r2'),
      ]);

      //
      // detach
      //
      pendingState.detachResources('author', 'a1', 'articleIds', 'r1');
      expect(pendingState.getOps()).toEqual([
        makeAddRelIdOp('article', 'r2', 'authorId', 'a1'),
        makeAddRelIdOp('author', 'a1', 'articleIds', 'r2'),
        makeRemoveRelIdOp('author', 'a1', 'articleIds', 'r1'),
        makeRemoveRelIdOp('article', 'r1', 'authorId', 'a1')
      ]);
    });

    test('attach and displace occupant resources', () => {
      const blogState: BlogState = {
        resources: {
          author: {
            'a1': { articleIds: ['r1'] },
            'a2': { articleIds: [] }
          },
          article: {
            'r1': { authorId: 'a1' }
          }
        },
        ids: {
          author: ['a1'],
          article: ['r1', 'r2']
        }
      };

      const pendingState = new PendingState(blogModelSchemaReader, blogState, blogSelectors);

      pendingState.attachResources('author', 'a2', 'articleIds', 'r1');
      expect(pendingState.getOps()).toEqual([
        makeRemoveRelIdOp('author', 'a1', 'articleIds', 'r1'),
        makeAddRelIdOp('author', 'a2', 'articleIds', 'r1'),
        makeAddRelIdOp('article', 'r1', 'authorId', 'a2'),
      ]);

      // todo need to test the reverse, and one-to-one
    });
  });
});
