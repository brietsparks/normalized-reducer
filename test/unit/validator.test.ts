import { cleanData, validateSchema } from '../../src/validator';
import { forumSchema, forumModelSchemaReader, Profile } from '../../src/test-cases';
import { Cardinalities } from '../../src';

const nonObjectLiterals = [1, '1', [], () => {}, null, true, undefined];

describe('unit/validator', () => {
  describe('validateSchema', () => {
    test('valid schema', () => {
      validateSchema(forumSchema);
    });

    it('throws if schema is not an object literal', () => {
      nonObjectLiterals.forEach(value => {
        // @ts-ignore
        const result = () => validateSchema(value);
        const error = new Error('schema must be an object literal');
        expect(result).toThrow(error);
      });
    });

    it('throws if an entity schema is not an object literal', () => {
      nonObjectLiterals.forEach(value => {
        // @ts-ignore
        const result = () => validateSchema({ chicken: value });
        const error = new Error('schema of type "chicken" must be an object literal');
        expect(result).toThrow(error);
      });
    });

    it('throws if a relation schema is not an object literal', () => {
      nonObjectLiterals.forEach(value => {
        // @ts-ignore
        const result = () => validateSchema({ chicken: { ownerId: value } });
        const error = new Error('schema of type "chicken" relation "ownerId" must be an object literal');
        expect(result).toThrow(error);
      });
    });

    it('throws if relation schema is missing attribute "type"', () => {
      const result = () =>
        validateSchema({
          chicken: {
            // @ts-ignore
            ownerId: {
              cardinality: Cardinalities.ONE,
              reciprocal: 'chickenIds',
            },
          },
          farmer: {
            chickenIds: {
              type: 'chicken',
              cardinality: Cardinalities.MANY,
              reciprocal: 'ownerId',
            },
          },
        });

      const error = new Error('schema of type "chicken" relation "ownerId" is missing "type" attribute');

      expect(result).toThrow(error);
    });

    it('throws if relation type does does not exist in the model schema', () => {
      const result = () =>
        validateSchema({
          chicken: {
            ownerId: {
              type: 'farmer',
              cardinality: Cardinalities.ONE,
              reciprocal: 'chickenIds',
            },
          },
        });

      const error = new Error(
        'schema of type "chicken" relation "ownerId" relates to type "farmer", but type "farmer" does not have an entity schema of its own'
      );

      expect(result).toThrow(error);
    });

    it('throws if relation schema is missing attribute "cardinality"', () => {
      const result = () =>
        validateSchema({
          chicken: {
            // @ts-ignore
            ownerId: {
              type: 'farmer',
              reciprocal: 'chickenIds',
            },
          },
          farmer: {
            chickenIds: {
              type: 'chicken',
              cardinality: Cardinalities.MANY,
              reciprocal: 'ownerId',
            },
          },
        });

      const error = new Error(
        'schema of type "chicken" relation "ownerId" is missing "cardinality" attribute'
      );

      expect(result).toThrow(error);
    });

    it('throws if cardinality is invalid', () => {
      const result = () =>
        validateSchema({
          chicken: {
            ownerId: {
              type: 'farmer',
              cardinality: 'foobar',
              reciprocal: 'chickenIds',
            },
          },
          farmer: {
            chickenIds: {
              type: 'chicken',
              cardinality: Cardinalities.MANY,
              reciprocal: 'ownerId',
            },
          },
        });

      const error = new Error(
        'schema of type "chicken" relation "ownerId" cardinality must be either "one" or "many"'
      );

      expect(result).toThrow(error);
    });

    it('throws if relation schema is missing attribute "reciprocal"', () => {
      const result = () =>
        validateSchema({
          chicken: {
            // @ts-ignore
            ownerId: {
              type: 'farmer',
              cardinality: Cardinalities.ONE,
            },
          },
          farmer: {
            chickenIds: {
              type: 'chicken',
              cardinality: Cardinalities.MANY,
              reciprocal: 'ownerId',
            },
          },
        });

      const error = new Error(
        'schema of type "chicken" relation "ownerId" is missing "reciprocal" attribute'
      );

      expect(result).toThrow(error);
    });

    it('throws if reciprocal does not point to a relation of the related type', () => {
      const result = () =>
        validateSchema({
          chicken: {
            ownerId: {
              type: 'farmer',
              cardinality: Cardinalities.ONE,
              reciprocal: 'foobarIds',
            },
          },
          farmer: {
            chickenIds: {
              type: 'chicken',
              cardinality: Cardinalities.MANY,
              reciprocal: 'ownerId',
            },
          },
        });

      const error = new Error(
        'schema of type "chicken" relation "ownerId" has a reciprocal of "foobarIds" on type "farmer", but "farmer" does not have a relation "foobarIds"'
      );

      expect(result).toThrow(error);
    });

    it('throws if reciprocal does not point to a relation that points back', () => {
      const result = () =>
        validateSchema({
          chicken: {
            ownerId: {
              type: 'farmer',
              cardinality: Cardinalities.ONE,
              reciprocal: 'chickenIds',
            },
            buyerId: {
              type: 'farmer',
              cardinality: Cardinalities.ONE,
              reciprocal: 'chickenIds',
            },
          },
          farmer: {
            chickenIds: {
              type: 'chicken',
              cardinality: Cardinalities.MANY,
              reciprocal: 'buyerId',
            },
          },
        });

      const error = new Error(
        'schema of type "chicken" relation "ownerId" has a reciprocal of "chickenIds" on type "farmer", but "chickenIds" does not point back to "ownerId"'
      );

      expect(result).toThrow(error);
    });
  });

  describe('cleanData', () => {
    it('removes relational data from an object literal', () => {
      const data: Profile = {
        firstName: 'foo',
        lastName: 'bar',
        accountId: 'a1',
        postIds: ['o1', 'o2'],
      };

      const result = cleanData(data, forumModelSchemaReader, 'profile');

      const expected = {
        firstName: 'foo',
        lastName: 'bar',
      };

      expect(result).toEqual(expected);
    });

    it('returns an object literal if data is not an object literal', () => {
      const result = cleanData(undefined, forumModelSchemaReader, 'profile');
      expect(result).toEqual({});
    });
  });
});
