import React from 'react';
import promiseFinally from 'promise.prototype.finally';
import { mount } from 'enzyme';

import { ResourceTable } from './ResourceTable';
import { api, fetch, _deferred } from '../__mocks__/resource';

promiseFinally.shim();

beforeEach(() => fetch.mockClear());

describe('default behaviour', () => {
  let root;

  beforeEach(() => {
    root = mount((
      <ResourceTable
        resource={api}
        rel="widgets"
      />
    ));
  })

  it('renders an Ant Table', () => {
    expect(root).toMatchSnapshot();
  });

  it('fetches data on mount', () => {
    expect(fetch).toHaveBeenCalledWith({ rel: 'widgets' }, {});
  });

  describe('fetch', () => {
    const widgets = [{
      properties: {
        name: 'Widget #1',
      }
    }, {
      properties: {
        name: 'Widget #2'
      }
    }];

    const result = {
      embedded: jest.fn((name: string) => widgets),
      properties: {
        total: widgets.length
      }
    }

    it('sets Table props before and after loading', () => {
      const table = root.find('Table');
      const promise = root.instance().fetch();

      expect(table.prop('loading')).toBe(true);
      expect(table.prop('pagination')).toEqual({ total: 0 });
      expect(table.prop('dataSource')).toEqual([]);
      _deferred.resolve(result);

      return promise.then(() => {
        expect(table.prop('loading')).toBe(false);
        expect(table.prop('pagination')).toEqual({ total: 2 });
        expect(table.prop('dataSource')).toBe(widgets);
      });
    });
  })

  describe('when table params change', () => {
    beforeEach(() => {
      const pagination = { current: 3 };
      const filters = {};
      const sorter = { columnKey: 'name', order: 'ascend' };

      root.find('Table').props().onChange(pagination, filters, sorter);
    });

    it('re-fetches data with new params', () => {
      expect(fetch).toHaveBeenCalledWith({ rel: 'widgets' }, {
        page: 3,
        order: {
          name: 'asc'
        }
      });
    });

    it('re-uses params on additional calls to .fetch()', () => {
      fetch.mockClear();
      root.instance().fetch();

      expect(fetch).toHaveBeenCalledWith({ rel: 'widgets' }, {
        page: 3,
        order: {
          name: 'asc'
        }
      });
    });
  });
});

describe('when `name` is specified', () => {
  let root;

  beforeEach(() => {
    root = mount((
      <ResourceTable
        resource={api}
        rel="widgets"
        name="collection"
      />
    ));
  })

  it('fetches link with `rel` and `name`', () => {
    expect(fetch).toHaveBeenCalledWith({ rel: 'widgets', name: 'collection' }, {});
  });
});
