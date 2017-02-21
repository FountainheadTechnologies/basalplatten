# BasalPlatten

BasalPlatten ('Base Plate') is a collection of core components and utilities to help build UIs, the 'Fountainhead' way.

Much like a 'seed' or 'boilerplate' project, it is intended to offer a 'quick-start' way of initalizing a new project. However, unlike similar projects, it is not intended to be 'forked' each time you start a new project.

Instead, simply install BasalPlatten as an NPM module:

```bash
$ npm install --save basalplatten
```

BasalPlatten assumes the following architecture and conventions:

- React + ReactDOM + Webpack2
- Application written in TypeScript
- Some kind of backend API emitting [HAL](https://tools.ietf.org/html/draft-kelly-json-hal-08) resources
- UI Components using [Ant Design](https://ant.design/docs/react/introduce)
- UI Routing & State Management using [UI Router React](https://ui-router.github.io/react/)
  - Plus the [Reactive Extensions plugin](https://github.com/ui-router/rx)

# Webpack2 Configuration

Generate a Webpack2-compatible configuration using `basalplatten/webpack/config`:

```javascript
// webpack.config.js
const {buildConfig} = require('basalplatten/webpack/config');

module.exports = buildConfig('myApp');
```

`buildConfig` accepts a second `options` object, which will be merged in with the default options. Alternatively, you may mutate the returned configuration object before exporting it.

Without any custom options or mutations, the webpack configuration will provide the following:

- Hot Module Reloading (using React Hot Loader 3.0 Beta 6)
- TypeScript 2.0 (using Awesome TypeScript Loader)
  - Entry point: `src/index.tsx`
