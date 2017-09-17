const widgetState = {
  name: () => 'widgets',
  params: () => undefined
}

const loginState = {
  name: () => 'login',
  params: () => undefined
}

export const transition = {
  _originalTarget: widgetState,

  targetState: () => loginState,

  originalTransition: () => ({
    targetState: () => transition._originalTarget
  }),

  router: {
    stateService: {
      go: jest.fn(),

      target: name => ({
        name: () => name,
        params: () => undefined
      })
    },
  }
}
