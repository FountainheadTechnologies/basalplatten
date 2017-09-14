import React from 'react';
import { Row } from 'antd';
import { Resource } from '@optics/hal-client';
import { Transition, TargetState } from '@uirouter/react';

import { CredentialStore } from '../CredentialStore';
import { LoginForm } from '../components/LoginForm';

import './Login.less';

export interface Props {
  transition: Transition;

  resolves: {
    api: Resource;
    credentialStore: CredentialStore;
    defaultReturnState?: string;
    fields?: React.ReactNode;
  }
}

export class Login extends React.Component<Props> {
  render() {
    const { resolves: { api, fields } } = this.props;

    return (
      <Row
        className="login"
        align="middle"
        justify="center"
        type="flex"
      >
        <LoginForm
          resourceForm={api.formNamed('token', 'create')}
          onSuccess={this._onSuccess}
          fields={fields}
        />
      </Row>
    );
  }

  protected _onSuccess = (resource: Resource) => {
    const { transition, resolves: { credentialStore, api } } = this.props;
    const { token } = resource.properties;

    credentialStore.setToken(token);

    Object.assign(api.config.headers, {
      Authorization: `Bearer ${token}`
    });

    const returnState = this._determineReturnState();

    const name = returnState.name() as string;
    const params = returnState.params();
    const options = {
      reload: true
    }

    transition
      .router
      .stateService
      .go(name, params, options);
  }

  protected _determineReturnState(): TargetState {
    const { transition } = this.props;

    const original = transition.originalTransition().targetState();
    const target = transition.targetState();

    if (original !== target) {
      return original;
    }

    const {
      resolves: {
        defaultReturnState = 'main'
      }
    } = this.props;

    return transition.router.stateService.target(defaultReturnState);
  }
}
