import React from 'react';
import PropTypes from 'prop-types';
import titleCase from 'title-case';
import moment from 'moment';

import AntForm from 'antd/lib/form';
import Input from 'antd/lib/input';
import 'antd/lib/input/style';
import Switch from 'antd/lib/switch';
import 'antd/lib/switch/style';

import { WrappedFormUtils, GetFieldDecoratorOptions } from 'antd/lib/form/Form';
import { Property } from '@optics/hal-client/dist/Form';

// @hack: Prevent TS/Babel from mangling reference to constructor
const _switch = Switch;

import { FormItemProps as AntFormItemProps } from 'antd/lib/form/FormItem';

import { Context as FormContext, childContextTypes } from './Form';

export interface Props extends AntFormItemProps {
  name: string;
  showLabel?: boolean;
  defaultValue?: any;
  label?: string;
}

interface Context extends FormContext {
  form: WrappedFormUtils;
}

export const SchemaField: React.StatelessComponent<Props> = (props, context: Context) => {
  const {
    name,
    children,
    showLabel = true,
    defaultValue,
    ...itemProps
  } = props;

  const { form, schema, defaultItemProps } = context;

  const property = schema.properties[name];
  const element = children || inputElement(property);
  const label = itemProps.label || titleCase(name);

  const decorate = form.getFieldDecorator(name, fieldDecoratorOptions(props, context, element, label));

  return (
    <AntForm.Item
      {...defaultItemProps}
      {...itemProps}
      label={showLabel ? label : undefined}
      key={name}
    >
      {decorate(element)}
    </AntForm.Item>
  );
}

const inputElement = (property: Property): React.ReactNode => (
  <Input />
);

const fieldDecoratorOptions =
  (props: Props, context: Context, element: React.ReactNode, label?: string): GetFieldDecoratorOptions => {
    const { name, defaultValue, required } = props;
    const { schema } = context;

    const property = schema.properties[name];

    let initialValue = defaultValue || (schema.default && schema.default[name]);
    if (initialValue && property.format === 'date-time') {
      initialValue = moment(initialValue);
    }

    let valuePropName = 'value';
    if (element && (element as React.ReactElement<any>).type === _switch) {
      valuePropName = 'checked';
    }

    const rules = [];
    if (schema.required.indexOf(name) > -1 || required === true) {
      rules.push({
        required: true,
        message: `${label} is required`
      });
    }

    return { initialValue, valuePropName, rules };
  }

SchemaField.contextTypes = {
  ...childContextTypes,
  form: PropTypes.object
}
