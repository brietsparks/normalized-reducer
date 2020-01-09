import { validateSchema } from '../validator';
import { forumSchema } from './test-cases/forum';
import { Cardinalities } from '../types';

const nonObjectLiterals = [1, '1' ,[] ,() => {}, null, true, undefined];

describe('validator', () => {
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
        const error = new Error('schema of entity "chicken" must be an object literal');
        expect(result).toThrow(error);
      });
    });

    it('throws if a relation schema is not an object literal', () => {
      nonObjectLiterals.forEach(value => {
        // @ts-ignore
        const result = () => validateSchema({ chicken: { ownerId: value } });
        const error = new Error('schema of entity "chicken" relation "ownerId" must be an object literal');
        expect(result).toThrow(error);
      });
    });

    it('throws if relation schema is missing attribute "entity"', () => {
      const result = () => validateSchema({
        chicken: {
          // @ts-ignore
          ownerId: {
            cardinality: Cardinalities.ONE,
            reciprocal: 'chickenIds'
          }
        },
        farmer: {
          chickenIds: {
            entity: 'chicken',
            cardinality: Cardinalities.MANY,
            reciprocal: 'ownerId'
          }
        }
      });

      const error = new Error('schema of entity "chicken" relation "ownerId" is missing "entity" attribute');

      expect(result).toThrow(error);
    });

    it('throws if relation entity does does not exist in the model schema', () => {
      const result = () => validateSchema({
        chicken: {
          ownerId: {
            entity: 'farmer',
            cardinality: Cardinalities.ONE,
            reciprocal: 'chickenIds'
          }
        }
      });

      const error = new Error('schema of entity "chicken" relation "ownerId" relates to entity "farmer", but entity "farmer" does not have an entity schema of its own');

      expect(result).toThrow(error);
    });

    it('throws if relation schema is missing attribute "cardinality"', () => {
      const result = () => validateSchema({
        chicken: {
          // @ts-ignore
          ownerId: {
            entity: 'farmer',
            reciprocal: 'chickenIds'
          }
        },
        farmer: {
          chickenIds: {
            entity: 'chicken',
            cardinality: Cardinalities.MANY,
            reciprocal: 'ownerId'
          }
        }
      });

      const error = new Error('schema of entity "chicken" relation "ownerId" is missing "cardinality" attribute');

      expect(result).toThrow(error);
    });

    it('throws if cardinality is invalid', () => {
      const result = () => validateSchema({
        chicken: {
          ownerId: {
            entity: 'farmer',
            cardinality: 'foobar',
            reciprocal: 'chickenIds'
          }
        },
        farmer: {
          chickenIds: {
            entity: 'chicken',
            cardinality: Cardinalities.MANY,
            reciprocal: 'ownerId'
          }
        }
      });

      const error = new Error('schema of entity "chicken" relation "ownerId" cardinality must be either "one" or "many"');

      expect(result).toThrow(error);
    });

    it('throws if relation schema is missing attribute "reciprocal"', () => {
      const result = () => validateSchema({
        chicken: {
          // @ts-ignore
          ownerId: {
            entity: 'farmer',
            cardinality: Cardinalities.ONE,
          }
        },
        farmer: {
          chickenIds: {
            entity: 'chicken',
            cardinality: Cardinalities.MANY,
            reciprocal: 'ownerId'
          }
        }
      });

      const error = new Error('schema of entity "chicken" relation "ownerId" is missing "reciprocal" attribute');

      expect(result).toThrow(error);
    });

    it('throws if reciprocal does not point to a relation of the related entity', () => {
      const result = () => validateSchema({
        chicken: {
          ownerId: {
            entity: 'farmer',
            cardinality: Cardinalities.ONE,
            reciprocal: 'foobarIds'
          }
        },
        farmer: {
          chickenIds: {
            entity: 'chicken',
            cardinality: Cardinalities.MANY,
            reciprocal: 'ownerId'
          }
        }
      });

      const error = new Error('schema of entity "chicken" relation "ownerId" has a reciprocal of "foobarIds" on entity "farmer", but "farmer" does not have a relation "foobarIds"')

      expect(result).toThrow(error);
    });

    it('throws if reciprocal does not point to a relation that points back', () => {
      const result = () => validateSchema({
        chicken: {
          ownerId: {
            entity: 'farmer',
            cardinality: Cardinalities.ONE,
            reciprocal: 'chickenIds'
          },
          buyerId: {
            entity: 'farmer',
            cardinality: Cardinalities.ONE,
            reciprocal: 'chickenIds'
          }
        },
        farmer: {
          chickenIds: {
            entity: 'chicken',
            cardinality: Cardinalities.MANY,
            reciprocal: 'buyerId'
          }
        }
      });

      const error = new Error('schema of entity "chicken" relation "ownerId" has a reciprocal of "chickenIds" on entity "farmer", but "chickenIds" does not point back to "ownerId"')

      expect(result).toThrow(error);
    });
  });
});
