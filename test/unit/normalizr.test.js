const { schema, normalize } = require('normalizr');

const { fromNormalizr } = require('../../src/normalizr');

describe('normalizr', () => {
  test('fromNormalizr', () => {
    //
    // denormalized data from:
    // https://github.com/paularmstrong/normalizr/blob/master/examples/relationships/input.json
    //
    const denormalizedData = [
      {
        id: '1',
        title: 'My first post!',
        author: {
          id: '123',
          name: 'Paul',
        },
        comments: [
          {
            id: '249',
            content: 'Nice post!',
            commenter: {
              id: '245',
              name: 'Jane',
            },
          },
          {
            id: '250',
            content: 'Thanks!',
            commenter: {
              id: '123',
              name: 'Paul',
            },
          },
        ],
      },
      {
        id: '2',
        title: 'This other post',
        author: {
          id: '123',
          name: 'Paul',
        },
        comments: [
          {
            id: '251',
            content: 'Your other post was nicer',
            commenter: {
              id: '245',
              name: 'Jane',
            },
          },
          {
            id: '252',
            content: 'I am a spammer!',
            commenter: {
              id: '246',
              name: 'Spambot5000',
            },
          },
        ],
      },
    ];

    //
    // schema from:
    // https://github.com/paularmstrong/normalizr/blob/master/examples/relationships/schema.js
    //
    const userProcessStrategy = (value, parent, key) => {
      switch (key) {
        case 'author':
          return { ...value, posts: [parent.id] };
        case 'commenter':
          return { ...value, comments: [parent.id] };
        default:
          return { ...value };
      }
    };

    const userMergeStrategy = (entityA, entityB) => {
      return {
        ...entityA,
        ...entityB,
        posts: [...(entityA.posts || []), ...(entityB.posts || [])],
        comments: [...(entityA.comments || []), ...(entityB.comments || [])],
      };
    };

    const user = new schema.Entity(
      'users',
      {},
      {
        mergeStrategy: userMergeStrategy,
        processStrategy: userProcessStrategy,
      }
    );

    const comment = new schema.Entity(
      'comments',
      {
        commenter: user,
      },
      {
        processStrategy: (value, parent, key) => {
          return { ...value, post: parent.id };
        },
      }
    );

    const post = new schema.Entity('posts', {
      author: user,
      comments: [comment],
    });

    const normalizrSchema = [post];

    const normalizedData = normalize(denormalizedData, normalizrSchema);

    //
    // take the output from normalizr and feed it into fromNormalizr
    //
    const state = fromNormalizr(normalizedData);

    const expectedState = {
      entities: {
        users: {
          '123': {
            id: '123',
            name: 'Paul',
            posts: ['1', '2'],
            comments: ['250'],
          },
          '245': {
            id: '245',
            name: 'Jane',
            comments: ['249', '251'],
            posts: [],
          },
          '246': {
            id: '246',
            name: 'Spambot5000',
            comments: ['252'],
          },
        },
        comments: {
          '249': {
            id: '249',
            content: 'Nice post!',
            commenter: '245',
            post: '1',
          },
          '250': {
            id: '250',
            content: 'Thanks!',
            commenter: '123',
            post: '1',
          },
          '251': {
            id: '251',
            content: 'Your other post was nicer',
            commenter: '245',
            post: '2',
          },
          '252': {
            id: '252',
            content: 'I am a spammer!',
            commenter: '246',
            post: '2',
          },
        },
        posts: {
          '1': {
            id: '1',
            title: 'My first post!',
            author: '123',
            comments: ['249', '250'],
          },
          '2': {
            id: '2',
            title: 'This other post',
            author: '123',
            comments: ['251', '252'],
          },
        },
      },
      ids: {
        users: ['123', '245', '246'],
        comments: ['249', '250', '251', '252'],
        posts: ['1', '2'],
      },
    };

    expect(state).toEqual(expectedState);
  });
});
