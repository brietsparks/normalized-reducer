# Normalized Reducer
Read and write normalized relational state.

This Readme:
1. [Install](https://github.com/brietsparks/normalized-reducer/tree/docs#install)
2. [Quick Start](https://github.com/brietsparks/normalized-reducer/tree/docs#quick-start)

## Install

`yarn add normalized-reducer`

## Quick Start

1. Define a schema that describes your data's relationships.
    ```javascript
    const mySchema = {
      list: {
        'todoIds': { entity: 'todo', cardinality: 'many', reciprocal: 'listId' }
      },
      'todo': {
        'listId': { entity: 'list', cardinality: 'one', reciprocal: 'todoIds' },
        'tagIds': { entity: 'tag', cardinality: 'many', reciprocal: 'todoIds'}
      },
      tag: {
        'todoIds': { entity: 'todo', cardinality: 'many', reciprocal: 'tagIds' }
      }
    }
    ```

2. Pass in the schema and get back a reducer, action creators, selectors, and more.
    ```javascript
    import makeNormalized from 'normalized-reducer'
    
    const {
      reducer,
      actionCreators,
      actionTypes,
      selectors,
      emptyState,
    } = makeNormalized(mySchema)
    ``` 

3. Use the reducer and actions to update the state.

    ```javascript
    // add resources
    dispatch(actionCreators.add('todo', 't1')) // add a resource
    dispatch(actionCreators.add('list', 'l1', { title: 'first todo list' })) // add a resource with data
    dispatch(actionCreators.add('todo', 't2', { value: 'buy a dozen eggs' }, { listId: 'l1' })) // add a resource attached to another
    
    // remove resources
    dispatch(actionCreators.remove('list', 'l1'))
    
    // edit resources
    dispatch(actionCreators.edit('todo', 't2', { value: 'buy three dozen eggs and a gallon of milk' }))
    
    // change resource order
    dispatch(actionCreators.move('todo', 0, 1)) // move from index 0 to 1
    
    // attach resources
    dispatch(actionCreators.attach('list', 'l1', 'todo', 't1'))
    
    // detach resources
    dispatch(actionCreators.detach('list', 'l1', 'todo', 't1'))
    
    // change related resource order
    dispatch(actionCreators.moveAttached('list', 'l1', 'todoIds', 0 , 1))
    
    // batch: all changes will occur in a single action
    dispatch(actionCreators.batch(
      actionCreators.add('list', 'l10'),
      actionCreators.add('todo', 't10'),
      actionCreators.attach('todo', 't11'),
    ))
    ```

4. To read state, you can use the provided selectors. You can also write your own.

    ```javascript
    const todoIds = selectors.getIds(state, { entity: 'todo' }) // ['t1', 't2']
    const todo = selectors.getResource(state, { entity: 'todo', id: 't2' }) // { value: 'buy a dozen eggs', listId: 'l1' }
    ```
   
   

