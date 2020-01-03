import { ModelSchema, EntitySchema, RelSchema, Cardinalities, AbstractResourceState, AbstractState } from './types';

export class ModelSchemaReader <S extends AbstractState> {
  schema: ModelSchema;
  entitySchemaReaders: Record<string, EntitySchemaReader<S>>;

  constructor(schema: ModelSchema) {
    this.schema = schema;

    this.entitySchemaReaders = Object.entries(schema).reduce(
      (entitySchemaReaders, [entity, entitySchema]) => {
        entitySchemaReaders[entity] = new EntitySchemaReader(entity, entitySchema, this);
        return entitySchemaReaders;
      },
      {} as Record<string, EntitySchemaReader<S>>
    );
  }

  getEmptyState(): S {
    const emptyState = this.getEntities().reduce((emptyState, entity) => {
      emptyState[entity] = {};
      return emptyState;
    }, {} as AbstractState);

    return emptyState as S;
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

export class EntitySchemaReader <S extends AbstractState> {
  entity: string;
  schema: EntitySchema;
  modelSchemaReader: ModelSchemaReader<S>;

  constructor(entity: string, schema: EntitySchema, modelSchemaReader: ModelSchemaReader<S>) {
    this.entity = entity;
    this.schema = schema;
    this.modelSchemaReader = modelSchemaReader;
  }

  getEntity() {
    return this.entity;
  }

  getEmptyResourceState() {
    return Object.entries(this.schema).reduce((state, [rel, relSchema]) => {
      if (relSchema.cardinality === Cardinalities.ONE) {
        state[rel] = undefined;
      }

      if (relSchema.cardinality === Cardinalities.MANY) {
        state[rel] = [];
      }

      return state;
    }, {} as AbstractResourceState)
  }

  getEmptyRelState(rel: string) {
    const cardinality = this.getCardinality(rel);
    return cardinality === Cardinalities.ONE ? undefined : [];
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
