import React from 'react';
import promiseFinally from 'promise.prototype.finally';
import { mount, ReactWrapper } from 'enzyme';

import { Form, FormComponent } from './Form';
import { createPerson } from '../__mocks__/resourceForm';

promiseFinally.shim();

const mockEvent = {
  preventDefault: jest.fn()
} as React.Event<any>

describe('default behaviour', () => {
  let form: ReactWrapper;
  let onSuccess = jest.fn();
  let onFailure = jest.fn();

  beforeEach(() => {
    form = mount(
      <Form
        resourceForm={createPerson}
        onSuccess={onSuccess}
        onFailure={onFailure}
      />
    );
  });

  it('renders an empty Ant form with a Submit button', () => {
    expect(form).toMatchSnapshot();
    expect(form.find('Button').exists()).toBe(true);
  });

  describe('when the form is submitted', () => {
    it('calls `props.onSuccess`', async () => {
      const result = { status: 'updated' };
      createPerson.submit.mockReturnValue(Promise.resolve(result));

      await form.find('Form').props().onSubmit(mockEvent);
      expect(onSuccess).toHaveBeenCalledWith(result);
    });

    it('calls `props.onFailure`', async () => {
      const error = Error('oh dear');
      createPerson.submit.mockReturnValue(Promise.reject(error));

      await form.find('Form').props().onSubmit(mockEvent);
      expect(onFailure).toHaveBeenCalledWith(error);
    });
  });

  describe('when form validation fails', () => {
    it('calls `props.onFailure`', async () => {
      form.find('FormComponent').prop('form')
        .validateFields = jest.fn().mockImplementation(cb => {
          cb(Error('User Name is required'), null);
        });

      await form.find('Form').props().onSubmit(mockEvent);
      expect(onFailure).toHaveBeenCalledWith(Error('One or more fields are invalid'));
    });
  });
});

describe('when `props.submitButton` is false', () => {
  let form: ReactWrapper;

  beforeEach(() => {
    form = mount(
      <Form
        resourceForm={createPerson}
        submitButton={false}
      />
    );
  });

  it('omits the Submit button', () => {
    expect(form.find('Button').exists()).toBe(false);
  });
});
