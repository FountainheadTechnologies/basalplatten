import React from 'react';
import promiseFinally from 'promise.prototype.finally';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Transition } from '@uirouter/react';
import { Resource } from '@optics/hal-client';
import { Input, Icon } from 'antd';

import { CredentialStore } from '../src/CredentialStore';
import { Login } from '../src/containers/Login';
import { SchemaField } from '../src/components/SchemaField';

promiseFinally.shim();

const mockState = (name: string) => ({
  name: () => name,
  params: () => undefined
}) as any;

const mockTransition = {
  targetState: () => mockState('login'),

  originalTransition: () => ({
    targetState: () => mockState('widgets')
  }),

  router: {
    stateService: {
      go: action('stateService.go')
    }
  }
} as any as Transition;

const mockApiResource = {
  config: {
    headers: {}
  },

  properties: {},

  formNamed(rel: string, name: string) {
    return {
      schema: {
        required: ['username', 'password'],
        properties: {
          username: { type: 'string' },
          password: { type: 'string' }
        }
      },

      submit(data: any, params: any) {
        action('Submitting Form')(
          rel,
          name,
          data,
          params
        )

        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve({
              properties: {
                token: `TOKEN_${Date.now()}`
              }
            });
          }, 500);
        });
      }
    }
  }
} as any as Resource;

const mockCredentialStore = {
  setToken(value: string) {
    action('credentialStore.setToken')(value);
  }
} as CredentialStore;

storiesOf('Login', module)
  .add('Default', () => (
    <Login
      transition={mockTransition}
      resolves={{
        api: mockApiResource,
        credentialStore: mockCredentialStore
      }}
    />
  ))
  .add('Customized fields', () => {
    const CustomFields: React.StatelessComponent = () => (
      <div>
        <SchemaField name="username" showLabel={false}>
          <Input addonBefore={<Icon type="user" />} placeholder="User Name" />
        </SchemaField>

        <SchemaField name="password" showLabel={false}>
          <Input addonBefore={<Icon type="lock" />} placeholder="Password" />
        </SchemaField>

        <SchemaField name="2fa_token" showLabel={false}>
          <Input addonBefore={<Icon type="calculator" />} placeholder="2FA Token" />
        </SchemaField>
      </div>
    );

    return (
      <Login
        transition={mockTransition}
        resolves={{
          api: mockApiResource,
          credentialStore: mockCredentialStore,
          fields: CustomFields
        }}
      />
    )
  });
