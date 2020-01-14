import {
  ModelSchema,
  EntitySchema,
  RelSchema,
  Cardinalities,
  ResourceState,
  ResourcesByEntityState,
  IdsByEntityState,
  State,
} from './types';

import { validateSchema } from './validator';

export class ModelSchemaReader {
  schema: ModelSchema;
  entitySchemaReaders: Record<string, EntitySchemaReader>;

  // singleton values
  private emptyState?: State;
  private emptyResourcesByEntityState?: ResourcesByEntityState;
  private emptyIdsByEntityState?: IdsByEntityState;

  constructor(schema: ModelSchema) {
    validateSchema(schema);

    this.schema = schema;

    this.entitySchemaReaders = Object.entries(schema).reduce(
      (entitySchemaReaders, [entity, entitySchema]) => {
        entitySchemaReaders[entity] = new EntitySchemaReader(entity, entitySchema, this);
        return entitySchemaReaders;
      },
      {} as Record<string, EntitySchemaReader>
    );
  }

  getEmptyResourcesByEntityState() {
    if (!this.emptyResourcesByEntityState) {
      this.emptyResourcesByEntityState = this.getEntities().reduce((emptyState, entity) => {
        emptyState[entity] = {};
        return emptyState;
      }, {} as ResourcesByEntityState);
    }

    return this.emptyResourcesByEntityState;
  }

  getEmptyIdsByEntityState() {
    if (!this.emptyIdsByEntityState) {
      this.emptyIdsByEntityState = this.getEntities().reduce((idsState, entity) => {
        idsState[entity] = [];
        return idsState;
      }, {} as IdsByEntityState);
    }

    return this.emptyIdsByEntityState;
  }

  getEmptyState<S extends State>(): S {
    if (!this.emptyState) {
      this.emptyState = {
        resources: this.getEmptyResourcesByEntityState(),
        ids: this.getEmptyIdsByEntityState(),
      } as S;
    }

    return this.emptyState as S;
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
  entity: string;
  schema: EntitySchema;
  modelSchemaReader: ModelSchemaReader;

  constructor(entity: string, schema: EntitySchema, modelSchemaReader: ModelSchemaReader) {
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
    }, {} as ResourceState)
  }

  getEmptyRelState(rel: string) {
    const cardinality = this.getCardinality(rel);
    return cardinality === Cardinalities.ONE ? undefined : [];
  }

  relIsValid(rel: string, resolve: boolean) {
    const hasRel = this.getRels().includes(rel);

    if (hasRel) {
      return true;
    }

    if (!resolve) {
      return false;
    }

    const entity = rel;

    let hasEntity = false;
    for (let relSchema of Object.values(this.schema)) {
      if (relSchema.entity === entity) {
        if (hasEntity) {
          return false;
        }

        hasEntity = true;
      }
    }

    return hasEntity;
  }

  resolveRel(entityOrRel: string, resolve: boolean) {
    const hasRel = this.getRels().includes(entityOrRel);

    if (hasRel) {
      return entityOrRel;
    }

    if (!resolve) {
      return undefined;
    }

    const entity = entityOrRel;

    let found = undefined;
    for (let [rel, relSchema] of Object.entries(this.schema)) {
      if (relSchema.entity === entity) {
        if (found) {
          return undefined;
        }

        found = rel;
      }
    }

    return found;
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
