import React from 'react';
import PropTypes from 'prop-types';
import { Resource, Form as HALForm } from '@optics/hal-client';
import { Data, Schema } from '@optics/hal-client/dist/Form';

import AntForm from 'antd/lib/form';
import 'antd/lib/form/style';

import Button from 'antd/lib/button';
import 'antd/lib/button/style';

import { FormProps as AntFormProps, WrappedFormUtils } from 'antd/lib/form/Form';
import { FormItemProps as AntFormItemProps } from 'antd/lib/form/FormItem';

const DEFAULT_SUBMIT_BUTTON = (
  <Button type="primary">
    Submit
  </Button>
);

export const childContextTypes = {
  schema: PropTypes.object,
  defaultItemProps: PropTypes.object
}

export interface Props {
  resourceForm: HALForm;
  submitButton?: React.ReactElement<any> | false;
  onSuccess?: (result: Resource) => void;
  onFailure?: (error: Error) => void;
  defaultItemProps?: Partial<AntFormItemProps>;
}

export interface State {
  submitting: boolean;
}

export interface Context {
  schema: Schema;
  defaultItemProps: Partial<AntFormItemProps>;
}

class FormComponent extends React.Component<Props & AntFormProps> {
  state: State = {
    submitting: false
  };

  static childContextTypes = childContextTypes;

  render() {
    const {
      resourceForm,
      submitButton,
      onSuccess,
      onFailure,
      children,
      form,
      ...formProps
    } = this.props;

    return (
      <AntForm
        {...formProps}
        onSubmit={this._onSubmit}
      >
        {children}
        {this._renderSubmitButton()}
      </AntForm>
    );
  }

  getChildContext() {
    return {
      schema: this.props.resourceForm.schema,
      defaultItemProps: this.props.defaultItemProps
    }
  }

  protected _renderSubmitButton() {
    const {
      submitButton = DEFAULT_SUBMIT_BUTTON
    } = this.props;

    if (submitButton === false) {
      return;
    }

    return React.cloneElement(submitButton, {
      loading: this.state.submitting,
      htmlType: 'submit'
    });
  }

  protected _validate = () =>
    new Promise<Data>((resolve, reject) => {
      (this.props.form as WrappedFormUtils)
        .validateFields((err, values) => {
          if (err) {
            return reject(Error('One or more fields are invalid'));
          }

          resolve(values);
        });
    })

  protected _onSubmit: React.EventHandler<React.FormEvent<any>> = e => {
    console.log('SUBMIT');
    e.preventDefault();

    this.setState({ submitting: true });

    this._validate()
      .then(values => {
        return this.props.resourceForm.submit(values);
      })
      .then(result => {
        if (this.props.onSuccess) {
          return this.props.onSuccess(result);
        }
      })
      .catch(error => {
        if (this.props.onFailure) {
          return this.props.onFailure(error);
        }

        throw error;
      })
      .finally(() => {
        this.setState({ submitting: false });
      });
  }
}

export const Form = AntForm.create()(FormComponent as any) as React.ComponentClass<Props>;
