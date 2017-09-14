import {buildRouter} from './ui-router';
import notification from 'antd/lib/notification';
import * as paramTypes from './ui-router/paramTypes';

it('adds a default error handler', async () => {
  var router = buildRouter();

  router.stateRegistry.register({
    name: 'badState',
    resolve: {
      willThrow: () => {
        throw 'whoops';
      }
    }
  });

  try {
    await router.stateService.go('badState');
  } catch (e) {}

  expect(notification.error).toHaveBeenCalled();
  var options = (notification.error as jest.Mock<any>).mock.calls[0][0];

  expect(options.message).toBe('State Transition Error');
  expect(options.description).toMatchSnapshot();
});

it('adds a URL redirection handler', () => {
  var router = buildRouter();

  try {
    window.location.pathname = '/test';
    router.urlRouter.sync();
  } catch (e) {}

  expect(notification.info).toHaveBeenCalled();
  var options = (notification.info as jest.Mock<any>).mock.calls[0][0];

  expect(options.message).toBe('Unknown URL');
  expect(options.description).toMatchSnapshot();
});

it('registers custom parameter type definitions', () => {
  var router = buildRouter();

  var registeredTypes = Object.keys(router.urlMatcherFactory.paramTypes.types);
  var definedTypes = Object.keys(paramTypes);

  expect(registeredTypes).toEqual(definedTypes);
});
