import React from 'react';
import { Table } from 'antd';
import { mount } from 'enzyme';

import { buildRouter } from '../ui-router';
import { stateParamsControlledTable } from './stateParamsControlledTable';

const router = buildRouter();

router.stateRegistry.register({
  name: 'test',
  params: {
    page: 1,
    where: null,
    order: null
  }
});

const ControlledTable = stateParamsControlledTable(Table);

const COLUMNS = [{
  dataIndex: 'forename'
}, {
  dataIndex: 'surname'
}, {
  dataIndex: 'active',
  filterMultiple: false,
  filters: [{
    text: 'Active',
    value: 'true'
  }, {
    text: 'Inactive',
    value: 'false'
  }]
}, {
  dataIndex: 'role',
  filterMultiple: true,
  filters: [{
    text: 'User',
    value: 'user'
  }, {
    text: 'Moderator',
    value: 'moderator'
  }, {
    text: 'Administrator',
    value: 'admin'
  }]
}];

beforeAll(async () => {
  await router.stateService.go('test');
});

it('maps `where` State Param to Column options', async () => {
  const root = mount((
    <ControlledTable columns={COLUMNS} />
  ), { context: { router } });

  const columnsBeforeTransition = root.find('Table').prop('columns');

  columnsBeforeTransition.forEach(column => {
    expect(column.filteredValue).toEqual([]);
  });

  await router.stateService.go('.', {
    where: {
      active: 'true'
    }
  });

  const columnsAfterTransition = root.find('Table').prop('columns');

  columnsAfterTransition.forEach(column => {
    if (column.dataIndex === 'active') {
      expect(column.filteredValue).toEqual(['true']);
    } else {
      expect(column.filteredValue).toEqual([]);
    }
  })
});

it('maps `order` State Param to Column options', async () => {
  const root = mount((
    <ControlledTable columns={COLUMNS} />
  ), { context: { router } });

  const columnsBeforeTransition = root.find('Table').prop('columns');

  columnsBeforeTransition.forEach(column => {
    expect(column.sortOrder).toBeUndefined();
  });

  await router.stateService.go('.', {
    order: {
      forename: 'asc'
    }
  });

  const columnsAfterTransition = root.find('Table').prop('columns');

  columnsAfterTransition.forEach(column => {
    if (column.dataIndex === 'forename') {
      expect(column.sortOrder).toEqual('ascend');
    } else {
      expect(column.sortOrder).toBeUndefined();
    }
  })
});

it('maps `page` State Param to Pagination options', async () => {
  await router.stateService.go('.', {
    page: 2
  });

  const root = mount((
    <ControlledTable columns={COLUMNS} />
  ), { context: { router } });

  const paginationBeforeTransition = root.find('Table').prop('pagination');
  expect(paginationBeforeTransition.current).toBe(2);

  await router.stateService.go('.', {
    page: 3
  });

  const paginationAfterTransition = root.find('Table').prop('pagination');
  expect(paginationAfterTransition.current).toBe(3);
});

it('changes State Params when table controls change', () => {
  spyOn(router.stateService, 'go');

  const root = mount((
    <ControlledTable columns={COLUMNS} />
  ), { context: { router } });

  const pagination = { current: 3 };
  const filters = { active: ['true'] };
  const sorter = { columnKey: 'forename', order: 'ascend' };

  root.find('Table').props().onChange(pagination, filters, sorter);

  expect(router.stateService.go).toHaveBeenCalledWith('.', {
    page: 3,
    where: {
      active: 'true'
    },
    order: {
      forename: 'asc'
    }
  });
});
