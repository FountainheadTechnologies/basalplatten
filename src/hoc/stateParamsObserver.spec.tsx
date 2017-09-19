import React from 'react';
import { UIRouterReact } from '@uirouter/react';
import { mount } from 'enzyme';

import { buildRouter } from '../ui-router';
import { stateParamsObserver } from './stateParamsObserver';

const router = buildRouter();

router.stateRegistry.register({
  name: 'test',
  url: '',
  params: {
    page: null,
    search: null,
    showDeleted: null
  }
})

const updateCountedComponent = () => {
  const self = React.StatelessComponent = () => {
    self.updates += 1;
    return (<div />);
  };

  self.updates = 0;
  self.displayName = `InnerComponent`;

  return self;
}

it('maps state param changes to props', async () => {
  const innerComponent = updateCountedComponent();
  const WrappedComponent = stateParamsObserver(innerComponent);

  const component = mount(<WrappedComponent />, { context: { router } });
  const inner = component.find('InnerComponent');

  await router.stateService.go('test', { page: 1 });
  expect(inner.props()).toEqual({
    '#': null,
    page: 1,
    search: null,
    showDeleted: null
  });

  await router.stateService.go('test', { page: 2, showDeleted: true });
  expect(inner.props()).toEqual({
    '#': null,
    page: 2,
    search: null,
    showDeleted: true
  });

  component.unmount();
});

it('uses a custom mapping function', async () => {
  const innerComponent = updateCountedComponent();
  const WrappedComponent = stateParamsObserver(
    innerComponent,
    (params, props) => {
      return ({
        ...props,
        page: params.page - 1
      });
    }
  )

  const component = mount(<WrappedComponent />, { context: { router } });
  const inner = component.find('InnerComponent');

  await router.stateService.go('test', { page: 1 });
  expect(inner.props()).toEqual({ page: 0 });

  await router.stateService.go('test', { page: 2 });
  expect(inner.props()).toEqual({ page: 1 });

  component.unmount();
});

it('does not update the component if mapped props have not changed', async () => {
  const innerComponent = updateCountedComponent();
  const WrappedComponent = stateParamsObserver(
    innerComponent,
    (params, props) => {
      return ({
        ...props,
        page: params.page
      });
    }
  )

  const component = mount(<WrappedComponent />, { context: { router } });
  const inner = component.find('InnerComponent');

  await router.stateService.go('test', { page: 1 });
  expect(inner.props()).toEqual({ page: 1 });

  const { updates } = innerComponent;

  await router.stateService.go('test', { page: 1, search: 'widgets' });
  expect(inner.props()).toEqual({ page: 1 });

  expect(updates).toEqual(innerComponent.updates);

  component.unmount();
});

it('maps props to wrapped component on mount', async () => {
  await router.stateService.go('test', { page: 3 });

  const innerComponent = updateCountedComponent();
  const WrappedComponent = stateParamsObserver(innerComponent);
  const component = mount(<WrappedComponent />, { context: { router } });

  const props = component.find('InnerComponent').props();
  expect(props).toEqual({
    '#': null,
    page: 3,
    search: 'widgets',
    showDeleted: true
  });
});

it('throws an error if @ui-router/rx is not installed', () => {
  const innerComponent = updateCountedComponent();
  const WrappedComponent = stateParamsObserver(innerComponent);

  const router = new UIRouterReact();

  expect(() => mount(<WrappedComponent />, { context: { router } })).toThrow();
});
