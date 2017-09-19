import React from 'react';
import { shallow } from 'enzyme';

import { buttonizedModal } from './buttonizedModal';

const TestModalContent = () => (
  <div>Test Modal Content</div>
);

describe('default behaviour', () => {
  const TestModal = buttonizedModal(TestModalContent, {
    button: {
      label: 'Test'
    }
  });

  const root = shallow(<TestModal />);

  it('renders a button', () => {
    expect(root).toMatchSnapshot();
    expect(root.find('Button').exists()).toBe(true);
    expect(root.find('Modal').exists()).toBe(false);
  });

  it('displays a modal when button is clicked', () => {
    root.find('Button').simulate('click');
    expect(root.find('Modal').prop('visible')).toBe(true);
  });

  it('hides the modal when modal.onOk is called', () => {
    root.find('Modal').props().onOk();
    expect(root.find('Modal').exists()).toBe(false);
  });

  it('hides the modal when modal.onCancel is called', () => {
    root.find('Button').simulate('click');
    root.find('Modal').props().onCancel();
    expect(root.find('Modal').exists()).toBe(false);
  });

  it('calls the handler set through `setOkHandler` when modal.onOk is called', () => {
    const handler = jest.fn();

    root.instance().setOkHandler(handler);
    root.find('Button').simulate('click');
    root.find('Modal').props().onOk();

    expect(handler).toHaveBeenCalled();
  });

  it('updates the footer when `setFooter` is called', () => {
    root.instance().setFooter('Hello');
    expect(root.find('Modal').prop('footer')).toBe('Hello');
  });

  it('sets the working state when `setWorking` is called', () => {
    root.instance().setWorking(true);
    const modalProps = root.find('Modal').props();

    expect(modalProps.confirmLoading).toBe(true);
    expect(modalProps.closable).toBe(false);
    expect(modalProps.maskClosable).toBe(false);
  });
})

describe('when `modal.closeButton` is `true`', () => {
  const TestModal = buttonizedModal(TestModalContent, {
    button: {
      label: 'Test'
    },
    modal: {
      closeButton: true
    }
  });

  const root = shallow(<TestModal />);

  it('only renders a close button in the modal footer', () => {
    root.find('Button').simulate('click');
    expect(root.find('Modal').prop('footer')).toMatchSnapshot();
  });

  it('closes the modal when button is clicked', () => {
    const button = shallow(root.find('Modal').prop('footer'));
    button.simulate('click');

    expect(root.find('Modal').exists()).toBe(false);
  });
});

describe('when `modal.maskClosable` is set', () => {
  const TestModal = buttonizedModal(TestModalContent, {
    modal: {
      maskClosable: true
    }
  });

  const root = shallow(<TestModal />);

  it('does not change when in working state', () => {
    root.find('Button').simulate('click');
    root.instance().setWorking(true);

    expect(root.find('Modal').prop('maskClosable')).toBe(true);
  });
});

describe('when `propMapper` is a function', () => {
  const TestModal = buttonizedModal(TestModalContent, props => ({
    modal: {
      title: `Test ${props.title}`
    }
  }));

  const root = shallow(<TestModal title="123" />);

  it('calls on mount and uses result to build child props', () => {
    root.find('Button').simulate('click');
    expect(root.find('Modal').prop('title')).toBe('Test 123');
  });
});
