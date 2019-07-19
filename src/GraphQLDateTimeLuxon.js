import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import { GraphQLError } from 'graphql/error';
import { DateTime, FixedOffsetZone } from 'luxon';


const serialize = (luxonDate) => {
  if (!luxonDate.isValid) {
    throw new GraphQLError(`${luxonDate.invalidExplanation}`);
  }

  return luxonDate.toISO();
};

const parseValue = (v) => {
  const luxonDate = DateTime.fromISO(v, { setZone: true, zone: FixedOffsetZone.utcInstance });

  if (!luxonDate.isValid) {
    throw new GraphQLError(luxonDate.invalidExplanation);
  }

  return luxonDate;
};

const parseLiteral = (ast) => {
  if (ast.kind !== Kind.STRING) {
    throw new GraphQLError(`expected: ${Kind.STRING} - found: ${ast.kind}`);
  }

  const v = ast.value.toString();

  return parseValue(v);
};

const GraphQLDateTimeLuxon = new GraphQLScalarType({
  name: 'GraphQLDateTimeLuxon',
  description: 'GraphQLDateTimeLuxon accepts Dates in ISO 8601 format and parses them to Luxon DateTime instances',

  // from database towards client
  serialize,

  // json from client towards database
  parseValue,

  // AST from client towards database
  parseLiteral,
});

module.exports = GraphQLDateTimeLuxon;
