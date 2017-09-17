import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { AlertProps } from 'antd/lib/alert';

import { LoginForm } from './LoginForm';
import { createToken } from '../__mocks__/resourceForm';

describe('default behaviour', () => {
  let loginForm: ReactWrapper;
  const onSuccess = jest.fn();

  beforeEach(() => {
    Date.now = jest.fn(() => 100);
    loginForm = mount(
      <LoginForm
        resourceForm={createToken}
        onSuccess={onSuccess}
      />
    );
  });

  it('renders an empty Form with an alert and Log In button', () => {
    expect(loginForm).toMatchSnapshot();
  });

  describe('when `state.error` is set', () => {
    beforeEach(() => {
      loginForm.setState({
        error: Error('oh dear')
      })
    });

    it('displays an Error alert', () => {
      const alertProps = loginForm.find('Alert').props() as AlertProps;

      expect(alertProps.type).toBe('error');
      expect(alertProps.message).toBe('oh dear');
    });
  });

  describe('when form submission succeeds', () => {
    it('calls `onSuccess` prop', () => {
      const result = { token: 'success' };

      loginForm.find('FormComponent').props().onSuccess(result);
      expect(onSuccess).toHaveBeenCalledWith(result);
    });

    it('resets `state.error`', () => {
      loginForm.setState({
        error: Error('oh dear')
      });

      loginForm.find('FormComponent').props().onSuccess();
      expect(loginForm.state('error')).toBeUndefined();
    });
  });

  describe('when form submission fails', () => {
    it('sets `state.error` to the error received', () => {
      const error = Error('oh no');

      loginForm.find('FormComponent').props().onFailure(error);
      expect(loginForm.state('error')).toBe(error);
    });
  });
});

describe('when `props.alert` is a function', () => {
  let loginForm: ReactWrapper;
  let renderAlert = jest.fn();

  beforeEach(() => {
    loginForm = mount(
      <LoginForm
        resourceForm={createToken}
        alert={renderAlert}
      />
    );
  });

  it('is called with `state.error`', () => {
    const error = Error('whoops');

    loginForm.setState({ error });
    expect(renderAlert).toHaveBeenCalledWith(error);
  });

  it('renders the element that was returned', () => {
    renderAlert.mockImplementationOnce(() => (
      <h1>TOP SECRET AREA</h1>
    ));

    loginForm.update();

    expect(loginForm.find('h1').text()).toBe('TOP SECRET AREA');
  });
});

describe('when `props.submitButton` is false', () => {
  let loginForm: ReactWrapper;

  beforeEach(() => {
    loginForm = mount(
      <LoginForm
        resourceForm={createToken}
        submitButton={false}
      />
    );
  });

  it('omits the Submit button', () => {
    expect(loginForm.find('Button').exists()).toBe(false);
  });
});
