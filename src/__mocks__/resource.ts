import { createToken } from './resourceForm';

export const _deferred = {
  resolve: undefined,
  reject: undefined
};

export const fetch = jest.fn((binding = {}, params = {}) => {
  return new Promise((resolve, reject) => {
    Object.assign(_deferred, { resolve, reject });
  });
});

export const api = {
  properties: {},
  meta: {},

  config: {
    headers: {}
  },

  link: (rel: string) => ({
    fetch: (params = {}) => fetch({ rel }, params),
  }),

  linkNamed: (rel: string, name: string) => ({
    fetch: (params = {}) => fetch({ rel, name }, params)
  }),

  formNamed(rel: string, name: string) {
    if (rel === 'token' && name === 'create') {
      return createToken;
    }
  }
}
