import moment from 'moment';

import { CredentialStore } from './CredentialStore';

const localStorage = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn()
}

Object.assign(global, { localStorage });

let store: CredentialStore;

beforeEach(() => {
  store = new CredentialStore('TEST_TOKEN');
});

afterEach(() => jest.resetAllMocks());

const makeToken = (payload: {}): string => {
  const header = btoa(JSON.stringify({
    alg: 'hs256',
    typ: 'JWT'
  }));

  const _payload = btoa(JSON.stringify(payload));

  return `${header}.${_payload}`;
}

describe('setToken()', () => {
  it('sets stored token', () => {
    store.setToken('test');

    expect(localStorage.setItem).toHaveBeenCalledWith('TEST_TOKEN', 'test');
  });
});

describe('getToken()', () => {
  describe('when token is missing', () => {
    it('returns `undefined`', () => {
      expect(store.getToken()).toBeUndefined();
    });
  });

  describe('when token has no expiry', () => {
    const token = makeToken({ id: 500 });

    it('returns the token', () => {
      localStorage.getItem.mockImplementation(() => token);
      expect(store.getToken()).toBe(token);
    });
  });

  describe('when the token has an expiry in the future', () => {
    const token = makeToken({
      id: 500,
      exp: moment().unix() + 1000
    });

    it('returns the token', () => {
      localStorage.getItem.mockImplementation(() => token);
      expect(store.getToken()).toBe(token);
    });
  });

  describe('when the token has an expiry in the past', () => {
    const token = makeToken({
      id: 500,
      exp: 1000
    });

    it('returns `undefined`', () => {
      localStorage.getItem.mockImplementation(() => token);
      expect(store.getToken()).toBeUndefined();
    });
  });
});

describe('clearToken()', () => {
  it('clears stored token', () => {
    store.clearToken();
    expect(localStorage.removeItem).toHaveBeenCalledWith('TEST_TOKEN');
  });
})
