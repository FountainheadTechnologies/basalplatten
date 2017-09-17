const submit = jest.fn();

export const createToken = {
  schema: {
    required: ['username', 'password'],
    properties: {
      username: { type: 'string' },
      password: { type: 'string' }
    },
  },

  submit
}

export const createPerson = {
  schema: {
    required: ['forename', 'surname'],
    properties: {
      forename: { type: 'string' },
      surname: { type: 'string' },
      date_of_birth: {
        type: 'string',
        format: 'date-time'
      }
    }
  },

  submit
}

export const updatePerson = {
  schema: {
    required: [],
    default: {
      forename: 'Test',
      surname: 'Person',
      date_of_birth: '1985-08-02T23:00:00.000Z'
    },
    properties: {
      forename: { type: 'string' },
      surname: { type: 'string' },
      date_of_birth: {
        type: 'string',
        format: 'date-time'
      }
    }
  }
}
