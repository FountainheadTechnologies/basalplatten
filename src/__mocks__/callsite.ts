module.exports = () => ([{
}, {
  getFileName: () => 'test-caller.js'
}]);
// @hack: Make module look like es6 to prevent mangling
module.exports.__esModule = true;
