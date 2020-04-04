import { ModelSchemaReader } from './schema';
import { isObjectLiteral } from './util';
import { Schema } from './interfaces';
import { Cardinalities } from './enums';

export const validateSchema = (schema: Schema) => {
  if (!isObjectLiteral(schema)) {
    throw new Error('schema must be an object literal');
  }

  Object.entries(schema).forEach(([type, entitySchema]) => {
    if (!isObjectLiteral(entitySchema)) {
      throw new Error(`schema of type "${type}" must be an object literal`);
    }

    Object.entries(entitySchema).forEach(([rel, relSchema]) => {
      if (!isObjectLiteral(relSchema)) {
        throw new Error(`schema of type "${type}" relation "${rel}" must be an object literal`);
      }

      if (!relSchema.hasOwnProperty('type')) {
        throw new Error(`schema of type "${type}" relation "${rel}" is missing "type" attribute`);
      }

      if (!schema.hasOwnProperty(relSchema.type)) {
        throw new Error(
          `schema of type "${type}" relation "${rel}" relates to type "${relSchema.type}", but type "${relSchema.type}" does not have an type schema of its own`
        );
      }

      if (!relSchema.hasOwnProperty('cardinality')) {
        throw new Error(`schema of type "${type}" relation "${rel}" is missing "cardinality" attribute`);
      }

      if (relSchema.cardinality !== Cardinalities.MANY && relSchema.cardinality !== Cardinalities.ONE) {
        throw new Error(
          `schema of type "${type}" relation "${rel}" cardinality must be either "${Cardinalities.ONE}" or "${Cardinalities.MANY}"`
        );
      }

      if (!relSchema.hasOwnProperty('reciprocal')) {
        throw new Error(`schema of type "${type}" relation "${rel}" is missing "reciprocal" attribute`);
      }

      if (!schema[relSchema.type][relSchema.reciprocal]) {
        throw new Error(
          `schema of type "${type}" relation "${rel}" has a reciprocal of "${relSchema.reciprocal}" on type "${relSchema.type}", but "${relSchema.type}" does not have a relation "${relSchema.reciprocal}"`
        );
      }

      if (
        schema[relSchema.type][relSchema.reciprocal] &&
        schema[relSchema.type][relSchema.reciprocal].reciprocal !== rel
      ) {
        throw new Error(
          `schema of type "${type}" relation "${rel}" has a reciprocal of "${relSchema.reciprocal}" on type "${relSchema.type}", but "${relSchema.reciprocal}" does not point back to "${rel}"`
        );
      }
    });
  });
};

// returns type data clean of that type's rel keys
// does not clean out keys that are rel type names
export const cleanData = (data: any, schema: ModelSchemaReader, type: string) => {
  return typeof data === 'object'
    ? Object.keys(data).reduce((cleanData, key) => {
        if (!schema.type(type).hasRelationKey(key)) {
          cleanData[key] = data[key];
        }
        return cleanData;
      }, {} as { [key: string]: any })
    : {};
};
