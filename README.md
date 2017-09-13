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
  - Babel compilation step (required by Ant Design's homebrew tree-shaking strategy)
- Less compilation
  - .less files ending in `.inline.less` will be embedded into `index.html`, useful for styling the IPL
- Dev Server configuration
  - Sets up a proxy to a backend API running at `localhost:8080` at `/api`

# UI-Router

Create a UI-Router instance pre-configured with all of our favourite things using `basalplatten/ui-router`:

```javascript
// AppEntryPoint.jsx
const {UIRouter} = require('@uirouter/react');
const {buildRouter} = require('basalplatten/ui-router');

var router = buildRouter();
router.stateRegistry.register({
  // ... your state definitions
});

<UIRouter router={router}>
  <UIView/>
</UIRouter>
```

The `buildRouter` factory provides you with a UI-Router instance preconfigured with our favourite things:

- Reactive Extensions plugin so that you can `.observe()` state parameter changes directly from components
- A default error handler that displays an [Error Notification](https://ant.design/components/notification/) when a state transition fails
- A URL routing handler that display a Notification and redirects to `/` when attempting to access a URL which does not match a state
- Custom parameter types

# UI-Router Parameter Types

A handful of custom parameter types that are useful for serializing state such as filter and order criteria from data tables into the URL. We use these types over the built-on `json` type as they're a little friendlier on the (human) eye.

If you use the `buildRouter` factory function in `basalplatten/ui-router`, then these types are already registered with the router instance and ready to use. Otherwise, you'll need to register them manually:

```javascript
const {where} = require('basalplatten/ui-router/paramTypes');

router.urlMatcherFactory.type('where', where);
```

### `where`

A parameter with the `where` type and following value:

```json
{
  "user_id": "13",
  "owner_id": "37",
  "status": ["completed", "failed"]
}
```

Will be encoded into the URL as `?user_id:13!owner_id:37!~status:completed,failed`.

### `order`

A parameter with the `order` type and following value:

```json
{
  "created_at": "desc"
}
```

Will be encoded into the URL as `?created_at:desc`.
