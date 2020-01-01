import { ModelSchemaReader } from './schema';
import { blogSchema } from './test-cases';
import { Cardinalities } from './types';

export const blogModelSchemaReader = new ModelSchemaReader(blogSchema);

describe('schema', () => {
  test('getReciprocalCardinality', () => {
    expect(
      blogModelSchemaReader.entity('author').getReciprocalCardinality('articleIds')
    ).toEqual(Cardinalities.ONE);

    expect(
      blogModelSchemaReader.entity('article').getReciprocalCardinality('authorId')
    ).toEqual(Cardinalities.MANY);
  });
});
