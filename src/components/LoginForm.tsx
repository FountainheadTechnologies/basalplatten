import React from 'react';
import PropTypes from 'prop-types';
import { Resource, Form as HALForm } from '@optics/hal-client';

import Alert, { AlertProps } from 'antd/lib/alert';
import 'antd/lib/alert/style';
import Button from 'antd/lib/button';
import { ButtonProps } from 'antd/lib/button/button';
import 'antd/lib/button/style';

import { Form as FormComponent } from './Form';
import { SchemaFields } from './SchemaFields';

import './LoginForm.less';

export interface Props {
  resourceForm: HALForm;
  onSuccess?: (resource: Resource) => void;
  alert?: (err?: Error) => Alert | undefined;
  submitButton?: ButtonProps | false;
  fields?: React.StatelessComponent<any> | React.ComponentClass<any> | React.ClassicComponentClass<any>;
}

export interface State {
  error?: Error
}

export class LoginForm extends React.Component<Props> {
  static contextTypes: React.ValidationMap<any> = {
    router: PropTypes.any
  }

  state: State = {};

  render() {
    const {
      resourceForm,
      fields: Fields = SchemaFields
    } = this.props;

    return (
      <div className="login-form">
        {this._renderAlert()}
        <FormComponent
          resourceForm={resourceForm}
          submitButton={this._renderSubmitButton()}
          onSuccess={this._onSuccess}
          onFailure={this._onFailure}
        >
          <Fields />
        </FormComponent>
      </div>
    );
  }

  protected _renderAlert() {
    if (this.props.alert) {
      return this.props.alert(this.state.error);
    }

    const props: AlertProps = this.state.error ? {
      className: 'login-form__alert login-form__alert--error',
      message: this.state.error.message,
      type: 'error',
      showIcon: true
    } : {
        className: 'login-form__alert login-form__alert--info',
        message: 'Please log in to continue',
        type: 'info',
        showIcon: true
      };

    return (
      <Alert {...props} />
    );
  }

  protected _renderSubmitButton() {
    if (this.props.submitButton === false) {
      return;
    }

    const props: ButtonProps = {
      ...this.props.submitButton,
      className: 'login-form__submit-button',
      type: 'primary',
      htmlType: 'submit'
    }

    return (
      <Button {...props}>
        Log In
      </Button>
    );
  }

  protected _onSuccess = (resource: Resource) => {
    if (this.props.onSuccess) {
      this.props.onSuccess(resource);
    }

    this.setState({ error: undefined });
  }

  protected _onFailure = (error: Error) => {
    this.setState({ error });
  }
}
