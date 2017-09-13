import * as React from 'react';
import {UIRouterReact, UIRouter, UIView, servicesPlugin, pushStateLocationPlugin} from '@uirouter/react';
import {ParamTypeDefinition, UrlParts} from '@uirouter/react';
import {UIRouterRx} from '@uirouter/rx';
import notification from 'antd/lib/notification';
import * as paramTypes from './ui-router/paramTypes';
import 'antd/lib/notification/style';

export const buildRouter = (): UIRouterReact => {
  var router = new UIRouterReact();

  router.plugin(servicesPlugin);
  router.plugin(pushStateLocationPlugin);
  router.plugin(UIRouterRx);

  router.stateService.defaultErrorHandler(err => {
    notification.error({
      message: 'State Transition Error',

      description: (
        <div>
          <p>The following error was encountered during a UI state transition:</p>
          <code>{err.stack}</code>
        </div>
      ),

      duration: null
    });

    throw err;
  });

  router.urlRouter.otherwise((matchValue, url, router) => {
    notification.info({
      message: 'Unknown URL',
      description: `The URL ${url.path} does not exist. You have been redirected to the home page.`
    });

    return '/';
  });

  Object.keys(paramTypes).forEach(name => {
    router.urlMatcherFactory.type(name, (paramTypes as any)[name]);
  });

  return router;
}

