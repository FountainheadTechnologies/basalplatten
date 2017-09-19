import React from 'react';
import { FormItemProps } from 'antd/lib/form/FormItem';

import { buttonizedModal, InjectedProps } from '../hoc/buttonizedModal';
import { Form, FormComponent, Props as FormProps } from './Form';

// @hack: Required to work around 'cannot be named' TS bug
import { ButtonProps } from 'antd/lib/button/button';
import { ModalProps } from 'antd/lib/modal/Modal';
import { State as BMState, Props as BMProps } from '../hoc/buttonizedModal';
export { ButtonProps, ModalProps, BMState, BMProps };

export interface Props {
  form: FormProps & {
    children?: React.ReactChildren
  };
  onSuccess?: (value: any) => void;
  onFailure?: (error: any) => void;
}

const DEFAULT_ITEM_PROPS: Partial<FormItemProps> = {
  labelCol: {
    span: 8
  },

  wrapperCol: {
    span: 16
  }
}

export class ModalFormComponent extends React.Component<Props & InjectedProps> {
  protected _form: FormComponent;

  render() {
    return (
      <Form
        defaultItemProps={DEFAULT_ITEM_PROPS}
        {...this.props.form}
        submitButton={false}
        onSuccess={this.onSuccess}
        wrappedComponentRef={(form: FormComponent) => this._form = form}
      >
        {this.props.form.children || this.props.children}
      </Form>
    );
  }

  componentWillMount() {
    this.props.setOkHandler(this._submit);
  }

  protected _submit = () => {
    this.props.setWorking(true);

    return this._form
      .submit()
      .finally(() => {
        this.props.setWorking(false);
      });
  }

  onSuccess = () => {
    this.props.setVisible(false);
  }
}

export const ModalForm = buttonizedModal<Props & BMProps>(ModalFormComponent, props => ({
  modal: {
    okText: 'Save',
    cancelText: 'Cancel'
  }
}));
