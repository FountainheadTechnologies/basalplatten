import React from 'react';
import PropTypes from 'prop-types';
import { UIRouterReact } from '@uirouter/react';
import { Subscription } from 'rxjs/Subscription';
import { equals } from 'ramda';
import 'rxjs/add/operator/distinctUntilChanged';

interface Params {
  [paramName: string]: any;
}

interface State {
  mappedProps: any;
}

interface Context {
  router: UIRouterReact;
}

export type ParamMapper = <P extends any, C extends any>(params: Params, props: P, context: C) => any;

const defaultParamMapper: ParamMapper = (params, props, context) =>
  ({ ...params, ...props as object } as typeof props);

export const stateParamsObserver =
  <P, SP>(Component: React.ComponentType<P & SP>, mapParamsToProps = defaultParamMapper) =>
    class StateParamsObserver extends React.Component<P, State> {
      context: Context;

      protected _paramsObserver: Subscription;

      static contextTypes = {
        ...Component.contextTypes,
        router: PropTypes.any
      }

      state: State = {
        mappedProps: {}
      }

      render() {
        return (
          <Component
            {...this.props}
            {...this.state.mappedProps}
          />
        );
      }

      componentWillMount() {
        const { params$ } = this.context.router.globals;

        if (!params$) {
          throw Error('router.globals.params$ does not exist - have you installed the @ui-router/rx plugin?');
        }

        this._paramsObserver = params$
          .map(params => mapParamsToProps(params, this.props, this.context))
          .distinctUntilChanged(equals)
          .subscribe(this._onMappedPropsChange);
      }

      componentWillUnmount() {
        this._paramsObserver.unsubscribe();
      }

      protected _onMappedPropsChange = (mappedProps: any) => {
        this.setState({ mappedProps });
      }
    }