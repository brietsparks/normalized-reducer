import { ModelSchemaReader } from './schema';
import { isObjectLiteral } from './util';
import { Cardinalities, ModelSchema, EntitySchema, RelSchema } from './types';

export const validateSchema = (schema: ModelSchema) => {
  if (!isObjectLiteral(schema)) {
    throw new Error('schema must be an object literal')
  }

  Object.entries(schema).forEach(([entity, entitySchema]) => {
    if (!isObjectLiteral(entitySchema)) {
      throw new Error(`schema of entity "${entity}" must be an object literal`);
    }

    Object.entries(entitySchema).forEach(([rel, relSchema]) => {
      if (!isObjectLiteral(relSchema)) {
        throw new Error(`schema of entity "${entity}" relation "${rel}" must be an object literal`);
      }

      if (!relSchema.hasOwnProperty('entity')) {
        throw new Error(`schema of entity "${entity}" relation "${rel}" is missing "entity" attribute`);
      }

      if (!schema.hasOwnProperty(relSchema.entity)) {
        throw new Error(`schema of entity "${entity}" relation "${rel}" relates to entity "${relSchema.entity}", but entity "${relSchema.entity}" does not have an entity schema of its own`);
      }

      if (!relSchema.hasOwnProperty('cardinality')) {
        throw new Error(`schema of entity "${entity}" relation "${rel}" is missing "cardinality" attribute`);
      }

      if (relSchema.cardinality !== Cardinalities.MANY && relSchema.cardinality !== Cardinalities.ONE) {
        throw new Error(`schema of entity "${entity}" relation "${rel}" cardinality must be either "${Cardinalities.ONE}" or "${Cardinalities.MANY}"`);
      }

      if (!relSchema.hasOwnProperty('reciprocal')) {
        throw new Error(`schema of entity "${entity}" relation "${rel}" is missing "reciprocal" attribute`);
      }

      if (!schema[relSchema.entity][relSchema.reciprocal]) {
        throw new Error(`schema of entity "${entity}" relation "${rel}" has a reciprocal of "${relSchema.reciprocal}" on entity "${relSchema.entity}", but "${relSchema.entity}" does not have a relation "${relSchema.reciprocal}"`);
      }

      if (
        schema[relSchema.entity][relSchema.reciprocal] &&
        schema[relSchema.entity][relSchema.reciprocal].reciprocal !== rel
      ) {
        throw new Error(`schema of entity "${entity}" relation "${rel}" has a reciprocal of "${relSchema.reciprocal}" on entity "${relSchema.entity}", but "${relSchema.reciprocal}" does not point back to "${rel}"`);
      }
    });
  })
};

export const cleanData = (data: any, schema: ModelSchemaReader, entity: string) => {
  return typeof data === 'object'
    ? Object.keys(data).reduce((cleanData, key) => {
      if (!schema.entity(entity).relExists(key)) {
        cleanData[key] = data[key];
      }
      return cleanData;
    }, {} as { [key: string]: any })
    : {};
};
