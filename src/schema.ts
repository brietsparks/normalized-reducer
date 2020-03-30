import { ModelSchema, EntitySchema, RelationSchema, EntitiesByType, IdsByType, State } from './interfaces';

import { Cardinalities } from './enums';

import { validateSchema } from './validator';

export class ModelSchemaReader {
  schema: ModelSchema;
  entitySchemaReaders: Record<string, EntitySchemaReader>;

  // singleton values
  private emptyState?: State;
  private emptyEntitiesByTypeState?: EntitiesByType;
  private emptyIdsByTypeState?: IdsByType;

  constructor(schema: ModelSchema) {
    validateSchema(schema);

    this.schema = schema;

    this.entitySchemaReaders = Object.entries(schema).reduce((entitySchemaReaders, [type, entitySchema]) => {
      entitySchemaReaders[type] = new EntitySchemaReader(type, entitySchema, this);
      return entitySchemaReaders;
    }, {} as Record<string, EntitySchemaReader>);
  }

  typeExists(type: string) {
    return this.getEntities().includes(type);
  }

  type(type: string) {
    return this.entitySchemaReaders[type];
  }

  getEntities() {
    return Object.keys(this.schema);
  }

  getEmptyEntitiesByTypeState() {
    if (!this.emptyEntitiesByTypeState) {
      this.emptyEntitiesByTypeState = this.getEntities().reduce((emptyState, type) => {
        emptyState[type] = {};
        return emptyState;
      }, {} as EntitiesByType);
    }

    return this.emptyEntitiesByTypeState;
  }

  getEmptyIdsByTypeState() {
    if (!this.emptyIdsByTypeState) {
      this.emptyIdsByTypeState = this.getEntities().reduce((idsState, type) => {
        idsState[type] = [];
        return idsState;
      }, {} as IdsByType);
    }

    return this.emptyIdsByTypeState;
  }

  getEmptyState<T extends State>(): T {
    if (!this.emptyState) {
      this.emptyState = {
        entities: this.getEmptyEntitiesByTypeState(),
        ids: this.getEmptyIdsByTypeState(),
      } as T;
    }

    return this.emptyState as T;
  }
}

export class EntitySchemaReader {
  type: string;
  schema: EntitySchema;
  modelSchemaReader: ModelSchemaReader;

  constructor(type: string, schema: EntitySchema, modelSchemaReader: ModelSchemaReader) {
    this.type = type;
    this.schema = schema;
    this.modelSchemaReader = modelSchemaReader;
  }

  getType() {
    return this.type;
  }

  hasRelationKey(relationKey: string) {
    return this.getRelationKeys().includes(relationKey);
  }

  resolveRelationKey(typeOrKey: string) {
    const hasRelationKey = this.hasRelationKey(typeOrKey);
    if (hasRelationKey) {
      return typeOrKey;
    }

    const relationType = typeOrKey;

    // Iterate the relation schemas to find the one whose entity is the relationType.
    // It is possible that multiple relation schemas point to the same type, and consequently,
    // multiple keys would point to the type; in such a case we would return undefined.
    let found = undefined;
    for (let relationKey of this.getRelationKeys()) {
      const relationSchema = this.getRelationSchema(relationKey);

      if (relationSchema.type === relationType) {
        if (found) {
          // If a previously iterated relation schema has the given type
          // then it means multiple relation schemas point to the given type,
          // and a single key can be returned. For now, return undefined. Maybe
          // later implement returning an array of keys.
          return undefined;
        }

        // flag that a schema of the given type has been found
        found = relationKey;
      }
    }

    return found;
  }

  resolveRelationType(typeOrKey: string) {
    // if given a key, then just get the type by key
    const hasRelationKey = this.hasRelationKey(typeOrKey);
    if (hasRelationKey) {
      return this.getRelationType(typeOrKey);
    }

    // if given a type, then iterate each schema to see
    // whether a relation schema contains the type,
    // and if so the just return the type
    const relationType = typeOrKey;
    for (let relationSchema of this.relationSchemas()) {
      if (relationSchema.type === relationType) {
        return relationType;
      }
    }

    return undefined;
  }

  resolveRelationCardinality(typeOrKey: string) {
    const relationKey = this.resolveRelationKey(typeOrKey);
    if (!relationKey) {
      return undefined;
    }

    return this.getRelationCardinality(relationKey);
  }

  resolveRelationReciprocalKey(typeOrKey: string) {
    const relationKey = this.resolveRelationKey(typeOrKey);
    if (!relationKey) {
      return undefined;
    }

    return this.getRelationReciprocalKey(relationKey);
  }

  resolveReciprocalCardinality(typeOrKey: string) {
    const relationKey = this.resolveRelationKey(typeOrKey);
    if (!relationKey) {
      return undefined;
    }

    const relationType = this.getRelationType(relationKey);
    const relationReciprocalKey = this.getRelationReciprocalKey(relationKey);

    if (!relationType || !relationReciprocalKey) {
      return undefined;
    }

    return this.modelSchemaReader.type(relationType).getRelationCardinality(relationReciprocalKey);
  }

  relationDataIsValid(rel: string, data: any) {
    const cardinality = this.getRelationCardinality(rel);

    return (
      (cardinality === Cardinalities.MANY && (data === undefined || Array.isArray(data))) ||
      (cardinality === Cardinalities.ONE && (data === undefined || typeof data === 'string'))
    );
  }

  getRelationKeys() {
    return Object.keys(this.schema);
  }

  relationSchemas(): RelationSchema[] {
    return Object.values(this.schema);
  }

  getRelationSchema(relationKey: string): RelationSchema {
    return this.schema[relationKey];
  }

  getRelationCardinality(relationKey: string) {
    return this.getRelationSchemaField(relationKey, 'cardinality');
  }

  getRelationType(relationKey: string) {
    return this.getRelationSchemaField(relationKey, 'type');
  }

  getRelationReciprocalKey(relationKey: string) {
    return this.getRelationSchemaField(relationKey, 'reciprocal');
  }

  //
  // state-getters
  //

  getEmptyEntityState(emptyRels?: boolean) {
    if (!emptyRels) {
      return {};
    }

    return Object.entries(this.schema).reduce((state, [reltype, relSchema]) => {
      if (relSchema.cardinality === Cardinalities.ONE) {
        state[reltype] = undefined;
      }

      if (relSchema.cardinality === Cardinalities.MANY) {
        state[reltype] = [];
      }

      return state;
    }, {} as { [k: string]: any });
  }

  getEmptyRelationState(relationKey: string) {
    const cardinality = this.getRelationCardinality(relationKey);
    return cardinality === Cardinalities.ONE ? undefined : [];
  }

  private getRelationSchemaField(relationKey: string, field: keyof RelationSchema) {
    const relationSchema = this.getRelationSchema(relationKey);

    if (!relationSchema) {
      return undefined;
    }

    return relationSchema[field] as string;
  }
}
