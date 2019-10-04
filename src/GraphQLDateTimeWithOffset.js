import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import { GraphQLError } from 'graphql/error';
import { DateTime, FixedOffsetZone } from 'luxon';

import GraphQLDateTimeLuxon from './GraphQLDateTimeLuxon';


const serialize = (value) => {
  if (!value) {
    return null;
  }
  // console.log("serialize");
  const { offset = 0, date } = value;

  if (!date) {
    throw new GraphQLError(`Requires object with structure { date: Date, offset: Number } - found: ${JSON.stringify(value)}`);
  }

  if (!(date instanceof Date)) {
    throw new GraphQLError(`Requires date parameter to be a date - found ${date}`);
  }

  if (!Number.isInteger(offset)) {
    throw new GraphQLError(`Requires offset to be a number - found ${offset}`);
  }

  if (Math.abs(offset) > 1440) {
    throw new GraphQLError(`Requires offset to be in range -1440 <= offset <= 1440 - found ${offset}`);
  }

  const zone = FixedOffsetZone.instance(offset);

  const luxonDate = DateTime.fromJSDate(date, { zone });

  return GraphQLDateTimeLuxon.serialize(luxonDate);
};

const parseValue = (v) => {
  if (!v) {
    return null;
  }

  const luxonDate = GraphQLDateTimeLuxon.parseValue(v);

  const date = luxonDate.toJSDate(),
        { offset } = luxonDate;

  return { date, offset };
};

const parseLiteral = (ast) => {
  if (ast.kind !== Kind.STRING) {
    throw new GraphQLError(`expected: ${Kind.STRING} - found: ${ast.kind}`);
  }

  const v = ast.value.toString();

  return parseValue(v);
};

const GraphQLDateTimeWithOffset = new GraphQLScalarType({
  name: 'GraphQLDateTimeWithOffset',
  description: 'GraphQLDateTimeWithOffset accepts Dates in ISO 8601 format and parses them to { date: Date, offset: Number } format',

  // from database towards client
  serialize,

  // json from client towards database
  parseValue,

  // AST from client towards database
  parseLiteral,
});

module.exports = GraphQLDateTimeWithOffset;
