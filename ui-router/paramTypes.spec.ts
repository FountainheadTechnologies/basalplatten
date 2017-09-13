import * as paramTypes from './paramTypes';

describe('where', () => {
  var obj = {
    user_id: '13',
    owner_id: '37',
    status: ['completed', 'failed']
  };

  var str = 'user_id:13!owner_id:37!~status:completed,failed';

  it('encodes an object to a string', () => {
    expect(paramTypes.where.encode(obj)).toBe(str);
  });

  it('decodes a string to an object', () => {
    expect(paramTypes.where.decode(str)).toEqual(obj);
  });

  it('matches the regex pattern', () => {
    expect(str).toMatch(paramTypes.where.pattern as RegExp);
    expect('test').not.toMatch(paramTypes.where.pattern as RegExp);
  });
});

describe('order', () => {
  var obj = {
    created_at: 'desc'
  };

  var str = 'created_at:desc';

  it('encodes an object to a string', () => {
    expect(paramTypes.order.encode(obj)).toBe(str);
  });

  it('decodes a string to an object', () => {
    expect(paramTypes.order.decode(str)).toEqual(obj);
  });

  it('matches the regex pattern', () => {
    expect(str).toMatch(paramTypes.order.pattern as RegExp);
    expect('test').not.toMatch(paramTypes.order.pattern as RegExp);
  });
});
