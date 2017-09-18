import React from 'react';
import promiseFinally from 'promise.prototype.finally';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { UIRouter, UISref, Transition } from '@uirouter/react';
import { Resource } from '@optics/hal-client';
import { Input, Icon, Table, LocaleProvider, Card, Button } from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';

import { CredentialStore } from '../src/CredentialStore';
import { Login } from '../src/containers/Login';
import { SchemaField } from '../src/components/SchemaField';
import { buildRouter } from '../src/ui-router';
import { stateParamsObserver } from '../src/hoc/stateParamsObserver';
import { stateParamsControlledTable } from '../src/hoc/stateParamsControlledTable';

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

const router = buildRouter();
router.stateRegistry.register({
  name: 'main',
  url: '/iframe.html',
  params: {
    page: 1,
    where: null,
    order: null
  }
});

const DisplayStateParams: React.StatelessComponent<any> = props => (
  <Card title="State Params">
    <code>{JSON.stringify(props)}</code>
  </Card>
);

const Paginator: React.StatelessComponent<any> = props => (
  <Button.Group>
    <UISref to="main" params={{ page: props.page - 1 }}>
      <Button icon="left-circle">Previous page</Button>
    </UISref>

    <UISref to="main" params={{ page: props.page + 1 }}>
      <Button icon="right-circle">Next page</Button>
    </UISref>
  </Button.Group>
);

const StateObservingStateParams = stateParamsObserver(DisplayStateParams);

const StateObservingPaginator = stateParamsObserver(Paginator);

const StateParamsControlledTable = stateParamsControlledTable(Table as any);

storiesOf('stateParamsObserver', module)
  .add('Default', () => (
    <UIRouter router={router}>
      <div>
        <StateObservingStateParams />
        <StateObservingPaginator />
      </div>
    </UIRouter>
  ));

storiesOf('stateParamsControlledTable', module)
  .add('Default', () => (
    <UIRouter router={router}>
      <LocaleProvider locale={enUS}>
        <div>
          <StateObservingStateParams />
          <StateParamsControlledTable
            defaultPageSize={15}
            columns={[{
              title: 'Forename',
              dataIndex: 'forename',
              sorter: true
            }, {
              title: 'Surname',
              dataIndex: 'surname',
              sorter: true
            }, {
              title: 'Date of birth',
              dataIndex: 'date_of_birth',
              sorter: true
            }, {
              title: 'Active',
              dataIndex: 'active',
              filterMultiple: false,
              filters: [{
                text: 'Active',
                value: 'true'
              }, {
                text: 'Inactive',
                value: 'false'
              }]
            }]}
          />

          <Button.Group>
            <UISref to="main" params={{ page: 1 }}>
              <Button>Page 1</Button>
            </UISref>

            <UISref to="main" params={{ page: 2 }}>
              <Button>Page 2</Button>
            </UISref>
          </Button.Group>

          <UISref to="main" params={{ order: { forename: 'asc' } }}>
            <Button>Order by forename</Button>
          </UISref>

          <UISref to="main" params={{ where: { active: 'true' } }}>
            <Button>Filter by active: 'true'</Button>
          </UISref>

          <UISref to="main" params={{ page: null, where: null, order: null }}>
            <Button>Reset all</Button>
          </UISref>
        </div>
      </LocaleProvider>
    </UIRouter>
  ))
