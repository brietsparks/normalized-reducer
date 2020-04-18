# Normalized Reducer [![Coverage Status](https://coveralls.io/repos/github/brietsparks/normalized-reducer/badge.svg?branch=master)](https://coveralls.io/github/brietsparks/normalized-reducer?branch=master)
An easy way to read and write normalized relational reducer state.

✓ use its declarative API without writing any reducer logic  
✓ easy to learn, with state management patterns you already know  
✓ zero-dependency, well-tested, written in TypeScript  
✓ framework-agnostic and integrates with normalizr

Table of Contents:
- [The Problem](https://github.com/brietsparks/normalized-reducer#the-problem)
- [The Solution](https://github.com/brietsparks/normalized-reducer#the-solution)
- [Install](https://github.com/brietsparks/normalized-reducer#install)
- [Quick Start](https://github.com/brietsparks/normalized-reducer#quick-start)
- [Demo](https://github.com/brietsparks/normalized-reducer#demo)
- [Comparison to Alternatives](https://github.com/brietsparks/normalized-reducer#comparison-to-alternatives)
- [Top-level API](https://github.com/brietsparks/normalized-reducer#top-level-api)
    - [Parameter: `schema`](https://github.com/brietsparks/normalized-reducer#parameter-schema)
    - [Parameter: `namespaced`](https://github.com/brietsparks/normalized-reducer#parameter-namespaced)
    - [Generic Parameter: `<S>`](https://github.com/brietsparks/normalized-reducer#generic-parameter-s-extends-state)
    - [Return Value](https://github.com/brietsparks/normalized-reducer#return-value)
- [Action-creators API](https://github.com/brietsparks/normalized-reducer#action-creators-api)
    - [`create`](https://github.com/brietsparks/normalized-reducer#create)
    - [`delete`](https://github.com/brietsparks/normalized-reducer#delete)
    - [`update`](https://github.com/brietsparks/normalized-reducer#update)
    - [`attach`](https://github.com/brietsparks/normalized-reducer#attach)
    - [`detach`](https://github.com/brietsparks/normalized-reducer#detach)
    - [`move`](https://github.com/brietsparks/normalized-reducer#move)
    - [`moveAttached`](https://github.com/brietsparks/normalized-reducer#moveAttached)
    - [`sort`](https://github.com/brietsparks/normalized-reducer#sort)
    - [`sortAttached`](https://github.com/brietsparks/normalized-reducer#sortAttached)
    - [`batch`](https://github.com/brietsparks/normalized-reducer#batch)
    - [`setState`](https://github.com/brietsparks/normalized-reducer#setState)
- [Selectors API](https://github.com/brietsparks/normalized-reducer#selectors-api)
    - [`getIds`](https://github.com/brietsparks/normalized-reducer#getIds)
    - [`getEntities`](https://github.com/brietsparks/normalized-reducer#getEntities)
    - [`getEntity`](https://github.com/brietsparks/normalized-reducer#getEntity)
- [Normalizr Integration](https://github.com/brietsparks/normalized-reducer#normalizr-integration)
- [LICENSE](https://github.com/brietsparks/normalized-reducer#license)

## The Problem
Managing [normalized relational data](https://redux.js.org/recipes/structuring-reducers/normalizing-state-shape/) presents various complexities such as:
- deleting an entity must result in its id being removed from all of its attached entities
- attaching/detaching two related entities requires the id of each entity being added/removed in the other 
- implementation of relational behavior differs depending on the cardinality
- most behavior varies based on current state, not just action inputs
- scaling a robust solution without abstraction results in lots of repeated logic

## The Solution
Normalized Reducer helps you manage normalized relational state without requiring any reducer/action boilerplate. Simply provide a declarative relational schema, and it gives you the reducers, actions, and selectors to read and write state according to that schema. 

## Install

`yarn add normalized-reducer`

## Quick Start

1. Define a schema that describes your data's relationships.
    ```javascript
    const mySchema = {
      list: {
        'itemIds': { type: 'item', cardinality: 'many', reciprocal: 'listId' }
      },
      item: {
        'listId': { type: 'list', cardinality: 'one', reciprocal: 'itemIds' },
        'tagIds': { type: 'tag', cardinality: 'many', reciprocal: 'itemIds'}
      },
      tag: {
        'itemIds': { type: 'item', cardinality: 'many', reciprocal: 'tagIds' }
      }
    }
    ```
   
   More info at: [Top-level API > Parameter: `schema`](https://github.com/brietsparks/normalized-reducer#parameter-schema)

2. Pass in the schema, and get back a reducer, action-creators, action-types, selectors, and empty state.
    ```javascript
    import makeNormalizedSlice from 'normalized-reducer'
    
    const {
      reducer,
      actionCreators,
      actionTypes,
      selectors,
      emptyState,
    } = makeNormalizedSlice(mySchema)
    ``` 
   
   More info at: [Top-level API > Return Value](https://github.com/brietsparks/normalized-reducer#return-value)

3. Use the `reducer` and `actions` to update the state. The following example assumes the use of `dispatch` from either React or React-Redux.

    With React:
    ```javascript
    const [state, dispatch] = useReducer(reducer, emptyState);
    ```
   
    With React-Redux:
    ```javascript
    const dispatch = useDispatch();
    ```

    Usage:
    ```javascript
    // add entities
    dispatch(actionCreators.create('item', 'i1')) // add an 'item' entity with an id of 'i1' 
    dispatch(actionCreators.create('list', 'l1', { title: 'first list' }), 3) // add a 'list' with id 'l1', with data, at index 3

    
    // delete entities
    dispatch(actionCreators.delete('list', 'l1')) // delete a 'list' entity whose id is 'l1' 
    
    // update entities
    dispatch(actionCreators.update('item', 'i1', { value: 'do a barrel roll!' })) // update 'item' whose id is 'l1', patch (partial update)
    dispatch(actionCreators.update('item', 'i1', { value: 'the sky is falling!' }, { method: 'put' })) // update, put (replacement update)

    // change an entity's ordinal value 
    dispatch(actionCreators.move('item', 0, 1)) // move the 'item' entity at index 0 to index 1
    
    // attach entities
    dispatch(actionCreators.attach('list', 'l1', 'item', 'i1')) // attach list l1 to item i1
    
    // detach entities
    dispatch(actionCreators.detach('list', 'l1', 'item', 'i1')) // detach list l1 from item i1
    
    // change an entity's ordinal value with respect to another entity
    dispatch(actionCreators.moveAttached('list', 'l1', 'itemIds', 1 , 3)) // in item l1's .itemIds, move the itemId at index 1 to index 3  
    
    // batch: all changes will occur in a single action
    dispatch(actionCreators.batch(
      actionCreators.create('list', 'l10'),
      actionCreators.create('item', 'i20'),
      actionCreators.attach('item', 'i20', 'listId', 'l10'),
    ))
   
    // sort entities
    dispatch(actionCreators.sort('item', (a, b) => (a.title > b.title ? 1 : -1))) // sort items by title
   
    // sort entities with respect to an attached entity
    dispatch(actionCreators.sortAttached('list', 'l1', 'itemIds', (a, b) => (a.value > b.value ? 1 : -1))) // in item l1's .itemIds, sort by value 
    ```
   
   More info at: [Action-creators API](https://github.com/brietsparks/normalized-reducer#action-creators-api)

4. Use the `selectors` to read state.

    ```javascript
    const itemIds = selectors.getIds(state, { type: 'item' }) // ['i1', 'i2']
    const items = selectors.getEntities(state, { type: 'item' }) // { 'i1': { ... }, 'i2': { ... } }
    const item = selectors.getEntity(state, { type: 'item', id: 'i2' }) // { value: 'the sky is falling!', listId: 'l1' }
    ```
   
   More info at: [Selectors API](https://github.com/brietsparks/normalized-reducer#selectors-api)

5. The empty state shape looks like:
   
   ```json
   {
     "entities": {
       "list": {},
       "item": {},
       "tag": {}
     },
     "ids": {
       "list": [],
       "item": [],
       "tag": []
     }
   }
   ```
   And a populated state could look like:
  
   ```json
   {
     "entities": {
       "list": { 
         "l1": { "itemIds": ["i1", "i2"] } 
       },
       "item": {
         "i1": { "listId": "l1" },
         "i2": { "listId": "l1", "tagIds": ["t1"] }    
       },
       "tag": {
         "t1": { "itemIds": ["i2"] }
       }
     },
     "ids": {
       "list": ["l1"],
       "item": ["i1", "i2"],
       "tag": ["t1"]
     }
   }
   ```

## Demo

### [Action demos and usage examples](https://brietsparks.github.io/normalized-reducer-demo/)

[Demo source repo](https://github.com/brietsparks/normalized-reducer-demo)

## Comparison to Alternatives
Normalized Reducer is comparable to [Redux ORM](https://github.com/redux-orm/redux-orm) and Redux Toolkit's [entity adapter](https://redux-toolkit.js.org/api/createEntityAdapter).

Comparison to Redux ORM:
- Normalized Reducer 
    - does not depend on Redux
    - supports [ordering of children (attached entities)](https://github.com/redux-orm/redux-orm/issues/19),  
    - does not require any non-declarative logic
    - is lighter and dependency-free
- Redux ORM 
    - has more advanced selectors features 
    - is more mature

Comparison to Redux Tookit's entity adapter
- Normalized Reducer 
    - performs relational state management
    - is dependency-free
- Redux Tookit's entity adapter
    - supports automatic entity ordering
    - is more mature and backed by Redux authorities

## Top-level API
The top-level default export is a higher-order function that accepts a `schema` and an optional `namespaced` argument and returns a reducer, action-creators, action-types, selectors, and empty state.
```
makeNormalizedSlice<S>(schema: ModelSchema, namespaced?: Namespaced): {
    reducer: Reducer<S>,
    actionCreators: ActionCreators<S>,
    actionTypes: ActionTypes,
    selectors: Selectors<S>,
    emptyState: S,
}
```

Example:
```javascript
import makeNormalizedSlice from 'normalized-reducer';

const {
  reducer,
  actionCreators,
  actionTypes,
  selectors,
  emptyState,
} = makeNormalizedSlice(mySchema, namespaced);
```

### Parameter: `schema`
The schema is an object literal that defines each entity and its relationships.

```typescript
interface Schema {
  [entityType: string]: {
    [relationKey: string]: {
      type: string; 
      reciprocal: string;
      cardinality: 'one'|'many';
    }
  }
}
```

Example:
```javascript
const schema = {
  list: {
    // Each list has many items, specified by the .itemIds attribute
    // On each item, the attribute which points back to its list is .listId
    itemIds: { 
      type: 'item', // points to schema.item
      reciprocal: 'listId', // points to schema.item.listId
      cardinality: 'many'
    }
  },
  item: {
    // Each item has one list, specified by the attribute .listId
    // On each list, the attribute which points back to the attached items is .itemIds
    listId: { 
      type: 'list', // points to schema.list
      reciprocal: 'itemIds', // points to schema.list.itemIds
      cardinality: 'one'
    },
  },
};
```

Note that `type` must be an entity type (a top-level key) within the schema, and `reciprocal` must be a relation key within that entity's definition. 

### Parameter: `namespaced`
This is an optional argument that lets you namespace the action-types, which is useful if you are going to compose the Normalized Reducer slice with other reducer slices in your application.

Example:
```javascript
const namespaced = actionType => `my-custom-namespace/${actionType}`; 
``` 

If the `namespaced` argument is not passed in, it defaults to `normalized/`.

### Generic Parameter: `<S extends State>`
The shape of the state, which must overlap with the following interface:
```typescript
export type State = {
  entities: {
    [type: string]: {
      [id in string|number]: { [k: string]: any }
    }
  },
  ids: {
    [type: string]: (string|number)[]
  },
};
```

Example:
```typescript
interface List {
  itemIds: string[]
}

interface Item {
  listId: string
}

interface State {
  entities: {
    list: Record<string, List>,
    item: Record<string, Item>
  },
  ids: {
    list: string[],
    item: string[]
  }
}

const normalizedSlice = makeNormalizedSlice<State>(schema)
```

### Return Value
Calling the top-level function will return an object literal containing the things to help you manage state:

- `reducer`
- `actionCreators`
- `actionTypes`
- `selectors`
- `emptyState`

### `reducer`
A function that accepts a state + action, and then returns the next state.
```
reducer(state: S, action: { type: string }): S
``` 

In a React setup, pass the reducer into `useReducer`:
```js
function MyComponent() {
  const [normalizedState, dispatch] = useReducer(reducer, emptyState)
}
```

In a Redux setup, compose the reducer with other reducers, or use it as the root reducer:
```js
const { reducer } = makeNormalizedSlice(schema)

// compose it with combineReducers
const reduxReducer = combineReducers({
  normalizedData: reducer,
  //...
})

// or used it as the root reducer
const store = createStore(reducer) 
```


### `actionCreators`
An object literal containing action-creators. See the [Action-creators API](https://github.com/brietsparks/normalized-reducer#action-creators-api) section.

### `actionTypes`
An object literal containing the action-types.

```javascript
const {
    CREATE,
    DELETE,
    UPDATE,
    MOVE,
    ATTACH,
    DETACH,
    MOVE_ATTACHED,
    SORT,
    SORT_ATTACHED,
    BATCH,
    SET_STATE,
} = actionTypes
```

Their values are namespaced according to the [`namespaced`](https://github.com/brietsparks/normalized-reducer#parameter-namespaced)
parameter of the top-level function. Example: `normalized/CREATE`

### `selectors`
An object literal containing the selectors. See the [Selectors API](https://github.com/brietsparks/normalized-reducer#selectors-api) section.

### `emptyState`
An object containing empty collections of each entity.

Example:
```json
{
  "entities": {
    "list": {},
    "item": {},
    "tag": {}
  },
  "ids": {
    "list": [],
    "item": [],
    "tag": []
  }
}
``` 


## Action-creators API
An action-creator is a function that takes parameters and returns an object literal describing how the reducer should enact change upon state. 

### `create`
Creates a new entity 
```
( entityType: string, 
  id: string|number, 
  data?: object, 
  index?: number
): CreateAction 
```
Parameters:
- `entityType`: the entity type 
- `id`: an id that doesn't belong to an existing entity
- `data`: optional, an object of arbitrary, non-relational data
- `index`: optional, a number greater than 0

Note:
- the `id` should be a string or number provided by your code, such as a generated uuid 
- if the `id` already belongs to an existing entity, then the action will be ignored.
- if no `data` is provided, then the entity will be initialized as an empty object.
- if relational attributes are in the `data`, then they will be ignored; to add relational data, use the `attach` action-creator after creating the entity.
- if an `index` is provided, then the entity will be inserted at that position in the collection, and if no `index` is provided the entity will be appended at the end of the collection.   

Example:
```javascript
// create a list with a random uuid as the id, and a title, inserted at index 3 
const creationAction = actionCreators.create('list', uuid(), { title: 'shopping list' }, 3)
```

### `delete`
Deletes an existing entity
```
( entityType: string, 
  id: string|number, 
  cascade?: SelectorTreeSchema
): DeleteAction
```
Parameters:
- `entityType`: the entity type 
- `id`: the id of an existing entity
- `cascade`: optional, an object literal describing a cascading deletion

Note:
- any entities that are attached to the deletable entity will be automatically detached from it.
- pass in `cascade` to delete entities that are attached to the deletable entity

Basic Example:
```javascript
// deletes a list whose id is 'l1', and automatically detaches any entities currently attached to it
const deletionAction = actionCreators.delete('list', 'l1');
```

Cascade Example:
```javascript
/*
deletes list whose id is 'l1', 
deletes any items attached to 'l1'
deletes any tags attached to those items
detaches any entities attached to the deleted entities
*/
const deletion = actionCreators.delete('list', 'l1', { itemIds: { tagIds: {} } });
```

### `update`
Updates an existing entity
```
( entityType: string, 
  id: string|number, 
  data: object,
  options?: { method?: 'patch'|'put' }
): UpdateAction 
```
Parameters:
- `entityType`: the entity type 
- `id`: the id of an existing entity
- `data`: an object of any arbitrary, non-relational data
- `options.method`: optional, whether to partially update or completely replace the entity's non-relational data

Note:
- if an entity with the `id` does not exist, then the action will be ignored
- if relational attributes are in the `data`, then they will be ignored; to update relational data, use the `attach` and `detach` action-creators.
- if no `method` option is provided, then it will default to a patch (partial update)

Example:
```javascript
// updates a list whose id is 'l1', partial-update
const updateAction = actionCreators.update('list', 'l1', { title: 'do now!' })

// updates a list whose id is 'l1', full replacement
const updateAction = actionCreators.update('list', 'l1', { title: 'do later' }, { method: 'put' })
```

### `attach`
Attaches two existing related entities
```
( entityType: string, 
  id: string|number, 
  relation: string,
  relatedId: string|number,
  options?: { index?: number; reciprocalIndex?: number }
): AttachAction
```
Parameters:
- `entityType`: the entity type
- `id`: the id of an existing entity
- `relation`: a relation key or relation type
- `attachableId`: the id of an existing entity to be attached
- `options.index`: optional, the insertion index within the entity's attached-id's collection
- `options.reciprocalIndex`: optional, same as `options.index`, but the opposite direction

Note:
- if either entity does not exist, then the action will be ignored
- if the relation does not exist as defined by the schema, then the action will be ignored,
- a has-one attachment can be displaced by a new attachment, and such a case, those displaced entities will automatically be detached 
- if indexing is not applicable for a given relationship, i.e. a has-one, then the indexing option will be ignored

Example:
```javascript
/*
attaches item 'i1' to tag 't1'
in item i1's tagIds array, t1 will be inserted at index 2
in tag t1's itemIds array, i1 will be inserted at index 3
*/
const attachmentAction = actionCreators.attach('item', 'i1', 'tagIds', 't1', 2, 3);
```

Displacement example:
```javascript
// attach list 'l1' to item 'i1'
const firstAttachment = actionCreators.attach('list', 'l1', 'itemId', 'i1');

// attach list 'l20' to item 'i1'
// this will automatically detach item 'i1' from list 'l1'
const secondAttachment = actionCreators.attach('list', 'l20', 'itemId', 'i1');
```

### `detach`
Detaches two attached entities
```
( entityType: string,
  id: string|number,
  relation: string,
  detachableId: string|number
): DetachAction 
```
Parameters:
- `entityType`: the entity type
- `id`: the id of an existing entity
- `relation`: a relation key or relation type
- `detachableId`: the id on an existing entity to be attached

Example:
```javascript
// detach item 'i1' from tag 't1'
const detachmentAction = actionCreators.detach('item', 'i1', 'tagIds', 't1')
```

### `move`
Changes an entity's ordinal position
```
( entityType: string,
  src: number,
  dest: number
): MoveAction
```
Parameters:
- `entityType`: the entity type 
- `src`: the source/starting index of the entity to reposition
- `dest`: the destination/ending index; where to move the entity to

Note:
- if either `src` or `dest` is less than 0, then the action will be ignored
- if `src` greater than the highest index, then the last entity will be moved
- if `dest` greater than the highest index, then, the entity will be move to last position

Example:
```javascript
// move the item at index 2 to index 5
const moveAction = actionCreators.move('item', 2, 5)
```

### `moveAttached`
Changes an entity's ordinal position with respect to an attached entity
```
( entityType: string,
  id: string|number,
  relation: string,
  src: number,
  dest: number
): MoveAttachedAction
```
Parameters:
- `entityType`: the entity type
- `id`: the id of an existing entity
- `relation`: the relation key of the collection containing the id to move 
- `src`: the source/starting index of the entity to reposition 
- `dest`: the destination/ending index; where to move the entity to

Note:
- if an entity with the `id` does not exist, then the action will be ignored
- if the relation is a has-one relation, then the action will be ignored
- if either `src` or `dest` is less than 0, then the action will be ignored
- if `src` greater than the highest index, then the last entity will be moved
- if `dest` greater than the highest index, then the entity will be move to last position

Example:
```javascript
// in list l1's itemIds array, move itemId at index 2 to index 5
const moveAction = actionCreators.moveAttached('list', 'l1', 'itemIds', 2, 5)
```

### `sort`
Sorts a top-level entity ids collection
```
<T>(
  entityType: string,
  compare: (a: T, b: T) => number
): SortAction
```
Parameters:
- `entityType`: the entity type
- `compare`: the sorting comparison function

Example:
```javascript
// sort list ids (state.ids.list) by title 
const sortAction = actionCreators.sort('list', (a, b) => (a.title > b.title ? 1 : -1))
```

### `sortAttached`
Sorts an entity's attached-ids collection
```
<T>(
  entityType: string,
  id: string|number,
  relation: string,
  compare: Compare<T>
): SortAction
```
Parameters:
- `entityType`: the entity type
- `id`: the id of an existing entity
- `relation`: the relation key or relation type of the collection to sort
- `compare`: the sorting comparison function

Note:
- if an entity with the `id` does not exist, then the action will be ignored
- if the relation is a has-one, then the action will be ignored

Example:
```javascript
// in list l1, sort the itemsIds array by by value 
const sortAction = actionCreators.sort('list', 'l1', 'itemIds', (a, b) => (a.value > b.value ? 1 : -1))
```

### `batch`
Runs a batch of actions in a single reduction
```
(...actions: Action[]): BatchAction
```
Parameters:
- `...actions`: Normalized Reducer actions excluding `batch` and `setState`

Note:
- each action acts upon the state produced by the previous action

Example:
```javascript
// create list 'l1', then create item 'i1', then attach them to each other
const batchAction = actionCreators.batch(
  actionCreators.create('list', 'l1'),
  actionCreators.create('item', 'i1'),
  actionCreators.attach('list', 'l1', 'itemIds', 'i1') // 'l1' and 'i1' would exist during this action due to the previous actions  
)
```
  
### `setState`
Sets the normalized state
```
(state: S): SetStateAction
```
Parameters:
- `state`: the state to set

Note:
- intended for initializing state
- does not guard against invalid data

Example:
```javascript
const state = {
  entities: {
    list: { 
      l1: { title: 'first list', itemIds: ['i1'] },
      l2: {} 
    },
    item: {
      i1: { value: 'do a barrel roll', listId: 'l1', tagIds: ['t1'] }
    },
    tag: {
      t1: { itemIds: ['i1'], value: 'urgent' }
    }
  },
  ids: {
    list: ['l1', 'l2'],
    item: ['i1'],
    tag: ['t1']
  }
}

const setStateAction = actionCreators.setState(state)
```

## Selectors API
Each selector is a function that takes the normalized state and returns a piece of the state. Currently, the selectors API is minimal, but are enough to access any part of the state slice so that you can build your own application-specific selectors. 

### `getIds`
Returns an array of ids of a given entity type
```
(state: S, args: { type: string }): (string|number)[]
```
Parameters:
- `state`: the normalized state
- `args.type`: the entity type 

Example:
```typescript
const listIds = selectors.getIds(state, { type: 'item' }) // ['l1', 'l2']
```

### `getEntities`
Returns an object literal mapping each entity's id to its data
```
<E>(state: S, args: { type: string }): Record<(string|number), E>
```
Parameters:
- `state`: the normalized state
- `args.type`: the entity type 

Generic Parameters:
- `<E>`: the entity's type

Example:
```typescript
const lists = selectors.getEntities(state, { type: 'item' })
/*
{ 
  l1: { title: 'first list', itemIds: ['i1', 'i2'] },
  l2: { title: 'second list', itemIds: [] } 
} 
*/
```

### `getEntity`
Returns an entity by its type and id
```
<E>(state: S, args: { type: string; id: string|number }): E | undefined
```
Parameters:
- `state`: the normalized state
- `args.type`: the entity type
- `args.id`: the entity id

Generic Parameters:
- `<E>`: the entity's type

Note:
- if the entity does not exist, then undefined will be returned

Example:
```typescript
const lists = selectors.getEntity(state, { type: 'item', id: 'i1' })
/*
{ title: 'first list', itemIds: ['i1', 'i2'] }
*/
```

## Normalizr Integration
The top-level named export `fromNormalizr` takes normalized data produced by a normalizr [`normalize`](https://github.com/paularmstrong/normalizr/blob/master/docs/api.md#normalizedata-schema) call and returns state that can be fed into the reducer.

Example:
```js
import { normalize } from 'normalizr'
import { fromNormalizr } from 'normalized-reducer'

const denormalizedData = {...}
const normalizrSchema = {...}

const normalizedData = normalize(denormalizedData, normalizrSchema);
const initialState = fromNormalizr(normalizedData);
```




## LICENSE
MIT
