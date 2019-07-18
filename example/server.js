const { ApolloServer, gql } = require('apollo-server');
const GraphQLDateTimeWithOffset = require('GraphQLDateTimeWithOffset');

// This is a (sample) collection of events we'll be able to query
// the GraphQL server for.  A more complete example might fetch
// from an existing data source like a REST API or database.

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

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  scalar GraphQLDateTimeWithOffset
  # Comments in GraphQL are defined with the hash (#) symbol.

  # This "Event" type can be used in other type declarations.
  type Event {
    title: String
    dateWithOffset: GraphQLDateTimeWithOffset
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    events: [Event]
  }

  type Mutation {
    addEvent(title: String
    dateWithOffset: GraphQLDateTimeWithOffset
  ): Event
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve events from the "events" array above.
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

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers });

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
