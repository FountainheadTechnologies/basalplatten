import React from 'react';
import promiseFinally from 'promise.prototype.finally';
import { shallow } from 'enzyme';

import { ModalForm, ModalFormComponent } from './ModalForm';
import { createPerson } from '../__mocks__/resourceForm';

promiseFinally.shim();

describe('default behaviour', () => {
  const root = shallow(
    <ModalForm />
  );

  it('renders a button', () => {
    expect(root).toMatchSnapshot();
  });
});

describe('wrapped component behaviour', () => {
  let _okHandler;
  const onSuccess = jest.fn();
  const setWorking = jest.fn();
  const setVisible = jest.fn();
  const setOkHandler = jest.fn(handler => {
    _okHandler = handler;
  });

  const root = shallow(
    <ModalFormComponent
      form={{ resource: createPerson }}
      setWorking={setWorking}
      setVisible={setVisible}
      setOkHandler={setOkHandler}
      onSuccess={onSuccess}
    />
  );

  it('calls `props.setWorking` while form is submitting', () => {
    let _p;
    let _resolve;

    root.instance()._form = {
      submit: () => {
        _p = new Promise((resolve) => {
          _resolve = resolve;
        })

        return _p;
      }
    };

    const handler = _okHandler().then(() => {
      expect(setWorking).toHaveBeenCalledWith(false);
    });

    expect(setWorking).toHaveBeenCalledWith(true);
    _resolve();

    return handler;
  });

  it('hides the form when submission succeeded', () => {
    root.props().onSuccess();
    expect(setVisible).toHaveBeenCalledWith(false);
    expect(onSuccess).toHaveBeenCalled();
  });
});
