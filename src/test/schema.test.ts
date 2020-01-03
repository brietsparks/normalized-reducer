import { blogModelSchemaReader } from './test-cases/blog';
import { Cardinalities } from '../types';

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
