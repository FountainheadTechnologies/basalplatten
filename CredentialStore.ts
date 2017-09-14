import moment from 'moment';

export class CredentialStore {
  constructor(protected _key: string) { }

  setToken(token: string) {
    localStorage.setItem(this._key, token);
  }

  getToken(): string | undefined {
    const token = localStorage.getItem(this._key);

    if (!token) {
      return;
    }

    const [, payload] = token.split('.');

    const { exp } = JSON.parse(atob(payload));

    if (exp && exp < moment().unix()) {
      return;
    }

    return token;
  }

  clearToken() {
    localStorage.removeItem(this._key);
  }
}
