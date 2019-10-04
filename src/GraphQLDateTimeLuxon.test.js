import { Kind } from 'graphql/language';
import { GraphQLError } from 'graphql/error';
import { DateTime, FixedOffsetZone } from 'luxon';

import GraphQLDateTimeWithOffset from './GraphQLDateTimeLuxon';


const { parseValue, parseLiteral, serialize } = GraphQLDateTimeWithOffset;


describe('serialize', () => {
  test('Should serialize now as ISOString', () => {
    const now = DateTime.local();
    const value = serialize(now);
    expect(value).toEqual(now.toISO());
  });

  test('Should return null when serializing null', () => {
    const value = serialize(null);
    expect(value).toEqual(null);
  });

  test('Should serialize as UTC', () => {
    const now = DateTime.fromISO('2019-07-18T10:41:27.923Z', { setZone: true, zone: FixedOffsetZone.utcInstance });
    const value = serialize(now);
    expect(value).toEqual('2019-07-18T10:41:27.923Z');
  });

  test('Should serialize with offset 0', () => {
    const now = DateTime.fromISO('2019-07-18T10:41:27.923Z', { setZone: true, zone: FixedOffsetZone.utcInstance });
    const value = serialize(now);
    expect(value).toEqual('2019-07-18T10:41:27.923Z');
  });
});

describe('parseValue', () => {
  test('Should parse ISOString as UTC', () => {
    const now = DateTime.local();
    const nowISO = now.toISO();

    const value = parseValue(nowISO);
    expect(value.toString()).toEqual(now.toString());
  });

  test('Should handle null gracefully', () => {
    const value = parseValue(null);
    expect(value).toEqual(null);
  });

  it('Should accept format', () => {
    const value = parseValue('2016-05-25T09:08:34.123+06:00');
    const date = DateTime.fromISO('2016-05-25T09:08:34.123+06:00', { setZone: true, zone: FixedOffsetZone.utcInstance });
    expect(value).toEqual(date);
  });

  it('Should treat dates without timezone specified as UTC', () => {
    const value = parseValue('2008-09-15T15:53:00');

    expect(value.toString()).toEqual('2008-09-15T15:53:00.000Z');
  });

  it('Should throw when date is not ISO', () => {
    expect(() => parseValue('2008-09-15T15:53:00sdfsdf')).toThrow(new GraphQLError("the input \"2008-09-15T15:53:00sdfsdf\" can't be parsed as ISO 8601"));
  });

  it('Should become Luxon object', () => {
    const value = parseValue('2008-09-15');

    expect(value.isValid).toEqual(true);
  });

  it('Should allow time input with offset', () => {
    const value = parseValue('15:53:00.322348-07:00');

    const date = DateTime.fromISO('15:53:00.322348-07:00', { setZone: true, zone: FixedOffsetZone.utcInstance });

    expect(value).toEqual(date);
  });
});


describe('parseLiteral', () => {
  test('Should fail parsing number as literal', async () => {
    const now = new Date(),
          nowISO = now.valueOf(),
          ast = { value: nowISO, kind: Kind.INT };

    await expect(() => parseLiteral(ast)).toThrow(new GraphQLError('expected: StringValue - found: IntValue'));
  });
});
