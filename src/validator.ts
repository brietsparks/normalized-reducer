import { ModelSchemaReader } from './schema';

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
