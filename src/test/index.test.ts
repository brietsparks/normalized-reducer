import makeModule from '..';

import { ModelSchema } from '../types';

describe('index', () => {
  describe('add', () => {
    test('', () => {
    });
    /*
    basic
      if id does not exist, then create the resource
      if id exists, do not create the resource

    with attachables
      singular rel
        if attachable resource does not exist, then do nothing
        one attachable
          set rel value to id
          if no resource rel key, then set key and value
          ignore index
        more than one attachable:
          overwrite each time
      reciprocal singular rel: same prev

      plural rel
        one attachable
          if no index, then append
          if index, then insert
          if no resource rel key, then set key and value

        more than one attachable:
          append/insert each
      reciprocal plural rel: same prev

      attachable resource does not exist
        when createNonexistent is false, then do nothing
        when createNonexistent is true, then create attachable

    */
  });

  describe('remove', () => {
    /*
    without attached
      if id exists, then remove resource
      if id does not exist, then do nothing

    with attached: detach from all related resources
    */
  });

  describe('attach', () => {
    /*
    singular rel
      set rel value to id
      if no resource rel key, then set key and value
      ignore index
    reciprocal singular rel: same prev

    plural rel
      if no index, then append
      if index, then insert
      if no resource rel key, then set key and value
    reciprocal plural rel: same prev
    */
  });

  describe('detach', () => {
    /*
    if resource does not exist, then do nothing
    if invalid attachment state, then remove the remaining rel id
      when only one resource exists
      when both exist but only one is attached
    if attachment does not exist then do nothing
    */
  });

  describe('batched actions', () => {
    // test that opposing actions negate each other's effects
  });
});
