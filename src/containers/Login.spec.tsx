import React from 'react';
import { mount } from 'enzyme';

import { Login } from './Login';
import { api } from '../__mocks__/resource';
import { credentialStore } from '../__mocks__/credentialStore';
import { transition } from '../__mocks__/transition';

const resolves = {
  api,
  credentialStore
}

const result = {
  properties: {
    token: 'test-token'
  }
};

describe('default behaviour', () => {
  const login = mount((
    <Login
      transition={transition}
      resolves={resolves}
    />
  ));

  it('renders a LoginForm', () => {
    expect(login).toMatchSnapshot();
  });

  describe('when form is submitted successfully', () => {
    it('updates stored token and transitions to original target state', () => {
      login.find('LoginForm').props().onSuccess(result);

      expect(credentialStore.setToken).toHaveBeenCalledWith('test-token');
      expect(transition.router.stateService.go).toHaveBeenCalledWith('widgets', undefined, { reload: true });
    });
  });
});

describe('when original and target state are identical (ie, hitting Login state directly)', () => {
  it('returns to state named `main` after successful submission', () => {
    transition._originalTarget = transition.targetState();

    const login = mount((
      <Login
        transition={transition}
        resolves={resolves}
      />
    ));

    login.find('LoginForm').props().onSuccess(result);

    expect(transition.router.stateService.go).toHaveBeenCalledWith('main', undefined, { reload: true });
  });

  it('returns to state named by `props.resolves.defaultReturnState` after successful submission', () => {
    transition._originalTarget = transition.targetState();

    const login = mount((
      <Login
        transition={transition}
        resolves={{
          ...resolves,
          defaultReturnState: 'dashboard'
        }}
      />
    ));

    login.find('LoginForm').props().onSuccess(result);

    expect(transition.router.stateService.go).toHaveBeenCalledWith('dashboard', undefined, { reload: true });
  });
});
