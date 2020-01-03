import { Batcher } from '../batcher';

import { BlogState, blogState, blogModelSchemaReader, blogSelectors } from './test-cases/blog';
import { makeAddRelIdOp, makeRemoveRelIdOp } from '../ops';

describe('batcher', () => {
  test('add-resource-op', () => {
    const batcher = new Batcher(blogModelSchemaReader, blogState, blogSelectors);
    // current state
    expect(batcher.checkExistence('author', 'a1')).toEqual(true);
    expect(batcher.checkExistence('article', 'r1')).toEqual(true);

    // modify the cache
    expect(batcher.checkExistence('author', 'a9000')).toEqual(false);
    batcher.addResource('author', 'a9000');
    expect(batcher.checkExistence('author', 'a9000')).toEqual(true);
  });

  describe('attach/detach resources', () => {
    test('detach then attach', () => {
      const batcher = new Batcher(blogModelSchemaReader, blogState, blogSelectors);

      //
      // detach
      //
      batcher.detachResources('author', 'a1', 'articleIds', 'r1');
      expect(batcher.getAll()).toEqual([
        makeRemoveRelIdOp('author', 'a1', 'articleIds', 'r1'),
        makeRemoveRelIdOp('article', 'r1', 'authorId', 'a1'),
      ]);

      batcher.detachResources('article', 'r2', 'authorId', 'a1');
      expect(batcher.getAll()).toEqual([
        makeRemoveRelIdOp('author', 'a1', 'articleIds', 'r1'),
        makeRemoveRelIdOp('article', 'r1', 'authorId', 'a1'),
        makeRemoveRelIdOp('article', 'r2', 'authorId', 'a1'),
        makeRemoveRelIdOp('author', 'a1', 'articleIds', 'r2'),
      ]);

      //
      // detach
      //
      batcher.attachResources('author', 'a1', 'articleIds', 'r1');
      expect(batcher.getAll()).toEqual([
        makeRemoveRelIdOp('article', 'r2', 'authorId', 'a1'),
        makeRemoveRelIdOp('author', 'a1', 'articleIds', 'r2'),
        makeAddRelIdOp('author', 'a1', 'articleIds', 'r1'),
        makeAddRelIdOp('article', 'r1', 'authorId', 'a1'),
      ]);
    });

    test('attach then detach', () => {
      const blogState: BlogState = {
        author: {
          'a1': { articleIds: [] }
        },
        article: {
          'r1': { authorId: undefined },
          'r2': { authorId: undefined },
        },
      };

      const batcher = new Batcher(blogModelSchemaReader, blogState, blogSelectors);

      //
      // attach
      //
      batcher.attachResources('author', 'a1', 'articleIds', 'r1');
      expect(batcher.getAll()).toEqual([
        makeAddRelIdOp('author', 'a1', 'articleIds', 'r1'),
        makeAddRelIdOp('article', 'r1', 'authorId', 'a1')
      ]);

      batcher.attachResources('article', 'r2', 'authorId', 'a1');
      expect(batcher.getAll()).toEqual([
        makeAddRelIdOp('author', 'a1', 'articleIds', 'r1'),
        makeAddRelIdOp('article', 'r1', 'authorId', 'a1'),
        makeAddRelIdOp('article', 'r2', 'authorId', 'a1'),
        makeAddRelIdOp('author', 'a1', 'articleIds', 'r2'),
      ]);

      //
      // detach
      //
      batcher.detachResources('author', 'a1', 'articleIds', 'r1');
      expect(batcher.getAll()).toEqual([
        makeAddRelIdOp('article', 'r2', 'authorId', 'a1'),
        makeAddRelIdOp('author', 'a1', 'articleIds', 'r2'),
        makeRemoveRelIdOp('author', 'a1', 'articleIds', 'r1'),
        makeRemoveRelIdOp('article', 'r1', 'authorId', 'a1')
      ]);
    });

    test('attach and displace occupant resources', () => {
      const blogState: BlogState = {
        author: {
          'a1': { articleIds: ['r1'] },
          'a2': { articleIds: [] }
        },
        article: {
          'r1': { authorId: 'a1' }
        }
      };

      const batcher = new Batcher(blogModelSchemaReader, blogState, blogSelectors);

      batcher.attachResources('author', 'a2', 'articleIds', 'r1');
      expect(batcher.getAll()).toEqual([
        makeRemoveRelIdOp('author', 'a1', 'articleIds', 'r1'),
        makeAddRelIdOp('author', 'a2', 'articleIds', 'r1'),
        makeAddRelIdOp('article', 'r1', 'authorId', 'a2'),
      ]);

      // todo need to test the reverse, and one-to-one
    });
  });
});
