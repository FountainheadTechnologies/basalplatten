import React from 'react';
import moment from 'moment';
import { mount } from 'enzyme';
import { Switch } from 'antd';

import { SchemaField } from './SchemaField';
import { createPerson, updatePerson } from '../__mocks__/resourceForm';

const mockForm = {
  _decorate: jest.fn(element => element),
  getFieldDecorator: jest.fn(() => mockForm._decorate)
}

const createContext = {
  form: mockForm,
  schema: createPerson.schema
}

const updateContext = {
  form: mockForm,
  schema: updatePerson.schema
}

describe('default behaviour', () => {
  const schemaField = mount(<SchemaField name="forename" />, { context: createContext });

  it('renders an Ant Form Item component with an Input element', () => {
    expect(schemaField).toMatchSnapshot();
    expect(schemaField.find('Input').exists()).toBe(true);
  });

  it('adds rules on Ant Form field decorator for required fields', () => {
    expect(mockForm.getFieldDecorator).toHaveBeenCalledWith('forename', {
      initialValue: undefined,
      valuePropName: 'value',
      rules: [{
        required: true,
        message: 'Forename is required'
      }]
    })
  });
});

describe('when field is not required in schema', () => {
  const schemaField = mount(<SchemaField name="date_of_birth" />, { context: createContext });

  it('does not add Ant Form field decorator rules', () => {
    expect(mockForm.getFieldDecorator).toHaveBeenCalledWith('date_of_birth', {
      initialValue: undefined,
      valuePropName: 'value',
      rules: []
    })
  });
});

describe('when `required` prop is set', () => {
  const schemaField = mount((
    <SchemaField
      name="date_of_birth"
      required={true}
    />
  ), { context: createContext });

  it('adds Ant Form field decorator rule, even if not required in schema', () => {
    expect(mockForm.getFieldDecorator).toHaveBeenCalledWith('date_of_birth', {
      initialValue: undefined,
      valuePropName: 'value',
      rules: [{
        required: true,
        message: 'Date Of Birth is required'
      }]
    });
  });
});

describe('when default value for field is in schema', () => {
  const schemaField = mount(<SchemaField name="forename" />, { context: updateContext });

  it('sets `initialValue` in field decorator options', () => {
    expect(mockForm.getFieldDecorator).toHaveBeenCalledWith('forename', {
      initialValue: 'Test',
      valuePropName: 'value',
      rules: []
    })
  });
});

describe('when field type in schema is `date-time`', () => {
  const schemaField = mount((<SchemaField name="date_of_birth" />), { context: updateContext });

  it('sets `initialValue` to a moment instance', () => {
    expect(mockForm.getFieldDecorator).toHaveBeenCalledWith('date_of_birth', {
      initialValue: jasmine.any(moment),
      valuePropName: 'value',
      rules: []
    });
  });
});

describe('when child element is an Ant Switch', () => {
  const schemaField = mount((
    <SchemaField
      name="enabled"
    >
      <Switch />
    </SchemaField>
  ), { context: updateContext });

  it('sets `valuePropName` to `checked`', () => {
    expect(mockForm.getFieldDecorator).toHaveBeenCalledWith('enabled', {
      initialValue: undefined,
      valuePropName: 'checked',
      rules: []
    })
  });
});

describe('when `props.showLabel` is false', () => {
  const schemaField = mount((
    <SchemaField
      name="date_of_birth"
      showLabel={false}
    />
  ), { context: createContext });

  it('does not set the label on the Ant Form Item element', () => {
    expect(schemaField.find('FormItem').prop('label')).toBeUndefined();
  });
});

describe('when schema type is `number`', () => {
  const schemaField = mount(<SchemaField name="credits" />, { context: updateContext });

  it('renders an `<InputNumber/>` element', () => {
    expect(schemaField.find('InputNumber').exists()).toBe(true);
  });
});

describe('when schema type is `date-time`', () => {
  const schemaField = mount(<SchemaField name="date_of_birth" />, { context: updateContext });

  it('renders a `<DatePicker/>` element', () => {
    expect(schemaField.find('PickerWrapper').exists()).toBe(true);
  });
});

describe('when schema type is `boolean`', () => {
  const schemaField = mount(<SchemaField name="enabled" />, { context: updateContext });

  it('renders a `<Switch/>` element', () => {
    expect(schemaField.find('Switch').exists()).toBe(true);
  });
});

describe('when schema type is `enum`', () => {
  const schemaField = mount(<SchemaField name="favourite_colour" />, { context: updateContext });

  it('renders a `<Select/>` element containing possible values', () => {
    expect(schemaField.find('Select').exists()).toBe(true);
    expect(schemaField.find('Select')).toMatchSnapshot();
  });
});
