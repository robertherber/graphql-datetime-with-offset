import { Kind } from 'graphql/language';
import { GraphQLError } from 'graphql/error';

import { parseValue, parseLiteral, serialize } from './GraphQLDateTimeWithOffset';


describe('serialize', () => {
  test('Should serialize now as ISOString', () => {
    const now = new Date();
    const value = serialize({ date: now });
    expect(value).toEqual(now.toISOString());
  });

  test('Should serialize as UTC', () => {
    const now = new Date('2019-07-18T10:41:27.923Z');
    const value = serialize({ date: now });
    expect(value).toEqual('2019-07-18T10:41:27.923Z');
  });

  test('Should serialize with offset 0', () => {
    const now = new Date('2019-07-18T10:41:27.923Z');
    const value = serialize({ date: now, offset: 0 });
    expect(value).toEqual('2019-07-18T10:41:27.923Z');
  });

  test('Should serialize with offset 999999999999', () => {
    const offset = 999999999999;
    const now = new Date('2019-07-18T10:41:27.923Z');
    expect(() => serialize({ date: now, offset })).toThrow(new GraphQLError(`serialize: offset is out of range -1440 <= offset <= 1440 - found ${offset}`));
  });

  test('Should serialize with offset -60', () => {
    const now = new Date('2019-07-18T10:41:27.923Z');
    const value = serialize({ date: now, offset: -60 });
    expect(value).toEqual('2019-07-18T09:41:27.923-01:00');
  });

  test('Should serialize with offset -125', () => {
    const now = new Date('2019-07-18T11:41:27.923Z');
    const value = serialize({ date: now, offset: -125 });
    expect(value).toEqual('2019-07-18T09:36:27.923-02:05');
  });
});

describe('parseValue', () => {
  test('Should parse ISOString as UTC', () => {
    const now = new Date();
    const nowISO = now.toISOString();

    const value = parseValue(nowISO);
    expect(value).toHaveProperty('date', now);
    expect(value).toHaveProperty('offset', 0);
  });

  it('Should accept format', () => {
    const value = parseValue('2016-05-25T09:08:34.123+06:00');
    expect(value).toHaveProperty('date', new Date('2016-05-25T09:08:34.123+06:00'));
    expect(value).toHaveProperty('offset', 360);
  });

  it('Should treat dates without timezone specified as UTC', () => {
    const value = parseValue('2008-09-15T15:53:00');

    expect(value).toHaveProperty('date', new Date('2008-09-15T15:53:00Z'));
    expect(value).toHaveProperty('offset', 0);
  });

  it('Should throw when date is not ISO', () => {
    expect(() => parseValue('2008-09-15T15:53:00sdfsdf')).toThrow(new GraphQLError("parseValue: the input \"2008-09-15T15:53:00sdfsdf\" can't be parsed as ISO 8601"));
  });

  it('Should allow date input', () => {
    const value = parseValue('2008-09-15');

    expect(value).toHaveProperty('date', new Date('2008-09-15T00:00:00Z'));
    expect(value).toHaveProperty('offset', 0);
  });

  it('Should allow time input with offset', () => {
    const value = parseValue('15:53:00.322348-07:00');

    expect(value).toHaveProperty('date');
    expect(value).toHaveProperty('offset', -420);
  });
});


describe('parseLiteral', () => {
  test('Should parse literal', () => {
    const now = new Date(),
          nowISO = now.toISOString();

    const value = parseLiteral({ value: nowISO, kind: Kind.STRING });
    expect(value).toHaveProperty('date', now);
    expect(value).toHaveProperty('offset', 0);
  });

  test('Should fail parsing number as literal', async () => {
    const now = new Date(),
          nowISO = now.valueOf(),
          ast = { value: nowISO, kind: Kind.NUMBER };

    await expect(() => parseLiteral(ast)).toThrow(new GraphQLError(`parseLiteral: require date with ISO format - found: ${ast.kind}`, [ast]));
  });
});
