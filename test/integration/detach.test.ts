// import makeModule from '../../src';
// import {
//   emptyState,
//   actionCreators,
//   reducer,
//   selectors,
//   actionTypes,
// } from '../../src/test-cases';

describe('integration/detach', () => {
  /*
  detach a one-to-one attachment
  detach a one-to-many attachment
  detach a many-to-many attachment
  detach given a relationType instead of a relationKey

  if no such entity type, then no change
  if entity not found, then no change
  if entity relation key not found, then no change
  if relation cardinality is one and the detachableId is not the attached id, then no change

  if partially attached (an invalid state), then detach what already exists
  */
  test('detach a one-to-one attachment', () => {});

  test('detach a one-to-many attachment', () => {});

  test('detach a many-to-many attachment', () => {});
});
