const { ApolloServer, gql } = require('apollo-server');
const { GraphQLDateTimeWithOffset } = require('graphql-datetime-with-offset');


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
