import React from 'react';
import titleCase from 'title-case';

import { Context, childContextTypes } from './Form';
import { SchemaField } from './SchemaField';

export interface Props {
  labels?: {
    [key: string]: string;
  };

  elements?: {
    [key: string]: React.ReactNode
  };

  only?: string[];
  except?: string[];
}

export const SchemaFields: React.StatelessComponent<Props> =
  ({
    labels = {},
    elements = {},
    only = [],
    except = []
  }: Props, { schema }: Context) => {
    if (only.length && except.length) {
      throw Error('Props `only` and `except` are mutually exclusive');
    }

    const keys = only.length ?
      Object.keys(schema.properties)
        .filter(schemaKey => only.indexOf(schemaKey) > -1) :
      Object.keys(schema.properties)
        .filter(schemaKey => except.indexOf(schemaKey) === -1);

    const fields = keys
      .map(key => (
        <SchemaField key={key} name={key} label={labels[key] || titleCase(key)}>
          {elements[key]}
        </SchemaField>
      ));

    return (
      <div className="schema-fields">
        {fields}
      </div>
    );
  }

SchemaFields.contextTypes = childContextTypes;
