import React from 'react';
import { shallow } from 'enzyme';
import { Button } from 'antd';

import { Form } from './Form';

const mockForm = {
  properties: {},
  submit: jest.fn().mockReturnValue(Promise.resolve())
} as any;

describe('default behaviour', () => {
  it('renders an empty Ant form', () => {
    const form = (
      <Form
        resourceForm={mockForm}
      />
    );

    expect(form).toMatchSnapshot();
  });

  it('triggers form submission', async () => {
    const form = shallow(
      <Form
        resourceForm={mockForm}
      />
    );

    expect(form.state().submitting).toBe(false);

    form
      .find(Button)
      .first()
      .simulate('click');
  });
});

