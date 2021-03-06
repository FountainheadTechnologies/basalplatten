import React from 'react';
import promiseFinally from 'promise.prototype.finally';
import { mount } from 'enzyme';

import { ResourceTable } from './ResourceTable';
import { api, fetch, _deferred } from '../__mocks__/resource';

promiseFinally.shim();

beforeEach(() => fetch.mockClear());

const COLUMNS = [{
  key: 'name'
}];

describe('default behaviour', () => {
  let root;

  beforeEach(() => {
    root = mount((
      <ResourceTable
        resource={api}
        columns={COLUMNS}
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
    let widgets;
    let result;

    beforeEach(() => {
      widgets = [{
        properties: {
          name: 'Widget #1',
        }
      }, {
        properties: {
          name: 'Widget #2'
        }
      }];

      result = {
        hasEmbedded: () => true,
        embedded: jest.fn((name: string) => widgets),
        properties: {
          count: widgets.length
        }
      }
    });

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

    describe('when `embedded` resource does not exist', () => {
      beforeEach(() => {
        result.hasEmbedded = () => false;
      });

      it('sets table data to an empty array', async () => {
        const table = root.find('Table');
        const promise = root.instance().fetch();
        _deferred.resolve(result);

        await promise;
        expect(table.prop('dataSource')).toEqual([]);
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
        where: {},
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
        where: {},
        order: {
          name: 'asc'
        }
      });
    });
  });

  describe('when `columns` prop changes', () => {
    it('fetches with new params', () => {
      fetch.mockClear();

      root.setProps({
        columns: [{
          key: 'name',
          filteredValue: ['test'],
          sortOrder: 'ascend'
        }]
      });

      expect(fetch).toHaveBeenCalledWith(({
        rel: 'widgets'
      }), ({
        where: {
          name: 'test'
        },
        order: {
          name: 'asc'
        }
      }));
    });
  });

  describe('when columns prop does not change', () => {
    it('does not trigger another fetch', () => {
      root.setProps({
        columns: [{
          key: 'name',
          filteredValue: ['test'],
          sortOrder: 'ascend'
        }]
      });

      fetch.mockClear();

      root.setProps({
        columns: [{
          key: 'name',
          filteredValue: ['test'],
          sortOrder: 'ascend'
        }]
      });

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('when `rel` prop changes', () => {
    it('fetches with new rel', () => {
      fetch.mockClear();

      root.setProps({
        rel: 'users'
      });

      expect(fetch).toHaveBeenCalledWith(({
        rel: 'users'
      }), ({
        where: undefined,
        order: undefined,
        page: undefined
      }));
    });
  });

  describe('when `name` prop changes', () => {
    it('fetches with new rel', () => {
      fetch.mockClear();

      root.setProps({
        name: 'item'
      });

      expect(fetch).toHaveBeenCalledWith(({
        rel: 'widgets',
        name: 'item'
      }), ({
        where: undefined,
        order: undefined,
        page: undefined
      }));
    });
  });

  describe('when `embedded` prop changes', () => {
    it('fetches again (although not really necessary)', () => {
      fetch.mockClear();

      root.setProps({
        embedded: 'something-else'
      });

      expect(fetch).toHaveBeenCalledWith(({
        rel: 'widgets'
      }), ({
        where: undefined,
        order: undefined,
        page: undefined
      }));
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

describe('when `customTitle` prop is specified', () => {
  let root;
  let titleFn;
  let widgets;
  let result;

  beforeEach(() => {
    widgets = [{
      properties: {
        name: 'Widget #1',
      }
    }, {
      properties: {
        name: 'Widget #2'
      }
    }];

    result = {
      hasEmbedded: () => true,
      embedded: jest.fn((name: string) => widgets),
      properties: {
        count: widgets.length
      }
    };

    titleFn = jest.fn();

    root = mount((
      <ResourceTable
        resource={api}
        rel="widgets"
        name="collection"
        customTitle={titleFn}
      />
    ));
  });

  it('is called with current page data and parent resource', async () => {
    const promise = root.instance().fetch();
    _deferred.resolve(result);
    await promise;

    const tableTitleFn = root.find('Table').prop('title');
    tableTitleFn(widgets);

    expect(titleFn).toHaveBeenCalledWith(widgets, result);
  });
});
