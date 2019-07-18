import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import { GraphQLError } from 'graphql/error';
import { DateTime, FixedOffsetZone } from 'luxon';


export const serialize = (value) => {
  // console.log("serialize");
  const { offset = 0, date } = value;

  if (!date) {
    throw new GraphQLError(`serialize: require object with structure { date: Date, offset: Number } found: ${JSON.stringify(value)}`);
  }

  if (!(date instanceof Date)) {
    throw new GraphQLError(`serialize: require date parameter to be a date - found ${date}`);
  }

  if (!Number.isInteger(offset)) {
    throw new GraphQLError(`serialize: offset is not a number - found ${offset}`);
  }

  if (Math.abs(offset) > 1440) {
    throw new GraphQLError(`serialize: offset is out of range -1440 <= offset <= 1440 - found ${offset}`);
  }

  const zone = FixedOffsetZone.instance(offset);

  if (!zone.isValid) {
    throw new GraphQLError(`serialize: invalid zone ${zone.invalidExplanation}`);
  }

  const luxonDate = DateTime.fromJSDate(date, { zone });

  if (!luxonDate.isValid) {
    throw new GraphQLError(`serialize: ${luxonDate.invalidExplanation}`);
  }

  return luxonDate.toISO();
};

export const parseValue = (v) => {
  const luxonDate = DateTime.fromISO(v, { setZone: true, zone: FixedOffsetZone.utcInstance });

  if (!luxonDate.isValid) {
    throw new GraphQLError(`parseValue: ${luxonDate.invalidExplanation}`);
  }

  const date = luxonDate.toJSDate(),
        { offset } = luxonDate;

  return { date, offset };
};

export const parseLiteral = (ast) => {
  // console.log("parseLiteral");
  if (ast.kind !== Kind.STRING) {
    throw new GraphQLError(`parseLiteral: require date with ISO format - found: ${ast.kind}`, [ast]);
  }

  const v = ast.value.toString();

  return parseValue(v);
};


export const GraphQLDateTimeWithOffset = new GraphQLScalarType({
  name: 'GraphQLDateTimeWithOffset',
  description: 'GraphQLDateTimeWithOffset accepts Dates in ISO 8601 format and parses them to { date: Date, offset: Number } format',

  // from database towards client
  serialize,

  // json from client towards database
  parseValue,

  // AST from client towards database
  parseLiteral,
});
