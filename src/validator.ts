import { ModelSchemaReader } from './schema';
import { AbstractState } from './types';

export const cleanData = <S extends AbstractState>(data: any, schema: ModelSchemaReader<S>, entity: string) => {
  return typeof data === 'object'
    ? Object.keys(data).reduce((cleanData, key) => {
      if (!schema.entity(entity).relExists(key)) {
        cleanData[key] = data[key];
      }
      return cleanData;
    }, {} as { [key: string]: any })
    : {};
};
