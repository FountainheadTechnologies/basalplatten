import React from 'react';
import { shallow } from 'enzyme';

import { SchemaFields } from './SchemaFields';
import { createPerson } from '../__mocks__/resourceForm';

const context = {
  schema: createPerson.schema
}

describe('default behaviour', () => {
  const schemaFields = shallow(<SchemaFields />, { context })

  it('renders SchemaField components for all properties in schema', () => {
    expect(schemaFields).toMatchSnapshot();
  });
});

describe('when `props.only` is set', () => {
  const schemaFields = shallow((
    <SchemaFields only={['forename', 'surname']} />
  ), { context })

  it('only renders SchemaField components for properties in schema and in `props.only`', () => {
    expect(schemaFields).toMatchSnapshot();
  });
});

describe('when `props.except` is set', () => {
  const schemaFields = shallow((
    <SchemaFields except={['date_of_birth']} />
  ), { context })

  it('renders SchemaField components for all properties in schema not in `props.except`', () => {
    expect(schemaFields).toMatchSnapshot();
  });
});

describe('when `props.except` and `props.only` are set', () => {
  it('throws an error', () => {
    expect(() => {
      shallow((
        <SchemaFields
          only={['forename']}
          except={['date_of_birth']}
        />
      ), { context });
    }).toThrowError('Props `only` and `except` are mutually exclusive');
  })
});
