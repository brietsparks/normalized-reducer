import { ModelSchema, EntitySchema, RelSchema, Cardinalities } from './types';

export class ModelSchemaReader {
  schema: ModelSchema;
  entitySchemaReaders: Record<string, EntitySchemaReader>;

  constructor(schema: ModelSchema) {
    this.schema = schema;

    this.entitySchemaReaders = Object.entries(schema).reduce(
      (entitySchemaReaders, [entity, entitySchema]) => {
        entitySchemaReaders[entity] = new EntitySchemaReader(entitySchema, this);
        return entitySchemaReaders;
      },
      {} as Record<string, EntitySchemaReader>
    );
  }

  entityExists(entity: string) {
    return this.getEntities().includes(entity);
  }

  entity(entity: string) {
    return this.entitySchemaReaders[entity];
  }

  getEntities() {
    return Object.keys(this.schema);
  }
}

export class EntitySchemaReader {
  schema: EntitySchema;
  modelSchemaReader: ModelSchemaReader;

  constructor(schema: EntitySchema, modelSchemaReader: ModelSchemaReader) {
    this.schema = schema;
    this.modelSchemaReader = modelSchemaReader;
  }

  relExists(rel: string) {
    return this.getRels().includes(rel);
  }

  relDataIsValid(rel: string, data: any) {
    const cardinality = this.getCardinality(rel);

    return (
      (cardinality === Cardinalities.MANY && (data === undefined || Array.isArray(data))) ||
      (cardinality === Cardinalities.ONE && (data === undefined || typeof data === 'string'))
    );
  }

  getRels() {
    return Object.keys(this.schema);
  }

  private getRelSchema(key: string): RelSchema {
    return this.schema[key];
  }

  getCardinality(rel: string) {
    return this.getRelSchemaField(rel, 'cardinality');
  }

  getRelEntity(rel: string) {
    return this.getRelSchemaField(rel, 'entity');
  }

  getReciprocalRel(rel: string) {
    return this.getRelSchemaField(rel, 'reciprocal');
  }

  getReciprocalCardinality(rel: string) {
    const relEntity = this.getRelEntity(rel);
    const reciprocalRel = this.getReciprocalRel(rel);

    if (!relEntity || !reciprocalRel) {
      return undefined
    }

    return this.modelSchemaReader
      .entity(relEntity)
      .getCardinality(reciprocalRel);
  }

  private getRelSchemaField(key: string, field: keyof RelSchema) {
    const relSchema = this.getRelSchema(key);

    if (!relSchema) {
      return undefined;
    }

    return relSchema[field] as string;
  }
}
