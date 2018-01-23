import React from 'react';
import { UIRouterReact, servicesPlugin, pushStateLocationPlugin } from '@uirouter/react';
import { UIRouterRx } from '@uirouter/rx';
import * as paramTypes from './ui-router/paramTypes';

import notification from 'antd/lib/notification';
import 'antd/lib/notification/style';

export const buildRouter = (): UIRouterReact => {
  var router = new UIRouterReact();

  router.plugin(servicesPlugin);
  router.plugin(pushStateLocationPlugin);
  router.plugin(UIRouterRx);

  router.stateService.defaultErrorHandler(err => {
    // 'Transition Superseded' errors should not be handled
    if (err.type && err.type === 2) {
      return;
    }

    notification.error({
      message: 'State Transition Error',

      description: (
        <div>
          <p>The following error was encountered during a UI state transition:</p>
          <code>{err.stack}</code>
        </div>
      )
    });

    throw err;
  });

  router.urlRouter.otherwise((matchValue, url, router) => {
    const description = url ?
      `The URL ${url.path} does not exist. You have been redirected.` :
      `You attempted to access an unknown URL. You have been redirected.`;

    notification.info({
      message: 'Unknown URL',
      description
    });

    return '/';
  });

  Object.keys(paramTypes).forEach(name => {
    router.urlMatcherFactory.type(name, (paramTypes as any)[name]);
  });

  return router;
}

