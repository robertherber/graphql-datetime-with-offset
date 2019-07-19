# graphql-datetime-with-offset

[![npm version](https://badge.fury.io/js/graphql-datetime-with-offset.svg)](http://badge.fury.io/js/graphql-datetime-with-offset)

graphql-datetime-with-offset is a scalar type to be used with [graphQL.js](https://github.com/graphql/graphql-js). From the client it accepts Dates in ISO 8601 format and parses them to { date: Date, offset: Number } format. It uses [Luxon](https://moment.github.io/luxon/) under the hood, and any ISO 8601 date specified should work with this scalar.

A basic understanding of [GraphQL](http://facebook.github.io/graphql/) and of the [graphQL.js](https://github.com/graphql/graphql-js) implementation is needed to provide context for this library.

## Getting started

Install `graphql-datetime-with-offset` using yarn

```sh
yarn add graphql-datetime-with-offset
```

Or using npm

```sh
npm install --save graphql-datetime-with-offset
```

## v2
Added option of using Luxon instance directly as `GraphQLDateTimeLuxon`. Also means there's a breaking change where you have to require `GraphQLDateTimeWithOffset` like this now:

`const { GraphQLDateTimeWithOffset } = require('graphql-datetime-with-offset');`

and if you want to use the Luxon instance directly:

``const { GraphQLDateTimeLuxon } = require('graphql-datetime-with-offset');``

## Examples

This is an example of how to use it, also available in the /examples folder:

```js
const { ApolloServer, gql } = require('apollo-server'),
      { GraphQLDateTimeWithOffset } = require('graphql-datetime-with-offset');


const data = {
  events: [
    {
      title: 'Meeting with Singapore Office',
      dateWithOffset: {
        date: new Date('2019-07-18T08:00:00.000Z'),
        offset: 480,
      },
    },
    {
      title: 'Meeting with New York Office',
      dateWithOffset: {
        date: new Date('2019-07-18T16:00:00.000Z'),
        offset: -300,
      },
    },
  ],
};

const typeDefs = gql`
  scalar GraphQLDateTimeWithOffset

  type Event {
    title: String
    dateWithOffset: GraphQLDateTimeWithOffset
  }

  type Query {
    events: [Event]
  }

  type Mutation {
    addEvent(
      title: String
      dateWithOffset: GraphQLDateTimeWithOffset
    ): Event
  }
`;

const resolvers = {
  GraphQLDateTimeWithOffset,
  Query: {
    events: () => data.events,
  },
  Mutation: {
    addEvent: (_, args) => {
      data.events = [
        ...data.events,
        args,
      ];
      return args;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```
