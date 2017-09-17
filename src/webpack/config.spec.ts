import { buildConfig, setProd } from './config';

it('builds a webpack configuration merged with `options`', () => {
  setProd(false);

  const config = buildConfig('testApp', {
    devTool: 'eval'
  });

  expect(config.entry.testApp).toEqual(jasmine.any(Array));
  expect(config.devTool).toBe('eval');
});

describe('when webpack is passed `-p` flag', () => {
  setProd(true);

  const config = buildConfig('testApp');
});
