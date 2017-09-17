import { createToken } from './resourceForm';

export const api = {
  properties: {},
  meta: {},

  config: {
    headers: {}
  },

  formNamed(rel: string, name: string) {
    if (rel === 'token' && name === 'create') {
      return createToken;
    }
  }
}
