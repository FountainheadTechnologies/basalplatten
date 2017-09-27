import React from 'react';
import Table from 'antd/lib/table';
import { TableProps } from 'antd/lib/table/Table';
import { ColumnProps } from 'antd/lib/table/Column';
import { PaginationProps } from 'antd/lib/pagination';
import { Resource } from '@optics/hal-client';
import { equals } from 'ramda';
import { defaultsDeep } from 'lodash';
import 'antd/lib/table/style';

import { filtersToWhereParam, sorterToOrderParam, Sorter, SORT_TO_ORDER } from '../hoc/stateParamsControlledTable';

export interface Props extends TableProps<any> {
  resource: Resource;
  rel: string;
  name?: string;
  embedded?: string;
  params?: {};
}

export interface State {
  loading: boolean;
  total: number;
  rows: Resource[];
  params: {};
}

export const columnsToWhereParam = (columns: ColumnProps<any>[] | undefined) => {
  if (!columns) {
    return;
  }

  const result: { [key: string]: string | string[] } = {};

  columns.forEach(column => {
    const key = column.key || column.dataIndex;

    if (!key) {
      return;
    }

    const values = column.filteredValue;

    if (!values || !values.length) {
      return;
    }

    result[key] = column.filterMultiple ? values : values[0];
  });

  return Object.keys(result).length ? result : undefined;
}

export const columnsToOrderParam = (columns: ColumnProps<any>[] | undefined) => {
  if (!columns) {
    return;
  }

  const result: { [key: string]: string } = {};

  columns.forEach(column => {
    const key = column.key || column.dataIndex;

    if (!key) {
      return;
    }

    if (typeof column.sortOrder !== 'string') {
      return;
    }

    result[key] = SORT_TO_ORDER[column.sortOrder];
  });

  return Object.keys(result).length ? result : undefined;
}

export const propsToParams = (props: Props) =>
  defaultsDeep({}, props.params, {
    page: (typeof props.pagination === 'object') ? props.pagination.current : undefined,
    where: columnsToWhereParam(props.columns),
    order: columnsToOrderParam(props.columns)
  })

export class ResourceTable extends React.PureComponent<Props, State> {
  state: State = {
    loading: false,
    total: 0,
    rows: [],
    params: propsToParams(this.props)
  }

  render() {
    const {
      resource,
      rel,
      name,
      embedded,
      ...tableProps
    } = this.props;

    const { loading, rows } = this.state;

    return (
      <Table
        rowKey={this._rowKey}
        {...tableProps}
        pagination={this.pagination()}
        loading={loading}
        dataSource={rows}
        onChange={this.onChange}
      />
    );
  }

  componentDidMount() {
    this.fetch();
  }

  componentWillReceiveProps(nextProps: Props) {
    let shouldFetch = (
      (nextProps.rel !== this.props.rel) ||
      (nextProps.name !== this.props.name) ||
      // @todo: Changing 'embedded' should not trigger a re-fetch
      (nextProps.embedded !== this.props.embedded)
    );

    let params: any = this._nextParams(nextProps);

    if (params) {
      this.setState({ params });
      shouldFetch = true;
    } else {
      params = this.state.params;
    }

    if (shouldFetch) {
      this.fetch(params, nextProps);
    }
  }

  pagination = () => {
    const { pagination } = this.props;
    const { total } = this.state;

    if (pagination === false) {
      return false;
    }

    return {
      ...pagination as {},
      total
    }
  }

  fetch = (params = { ...this.state.params, ...this.props.params }, { resource, rel, name, embedded } = this.props) => {
    this.setState({ loading: true });

    const link = name ?
      resource.linkNamed(rel, name) : resource.link(rel);

    return link.fetch(params as any)
      .then((result: Resource) => {
        this.setState({
          total: result.properties.count,
          rows: result.embedded(embedded || rel) as Resource[]
        })
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  onChange = (pagination: PaginationProps, filters: any, sorter: Sorter) => {
    const { columns, onChange, params } = this.props;

    const nextParams = defaultsDeep({}, params, {
      page: pagination.current || 1,
      where: filtersToWhereParam(columns, filters),
      order: sorterToOrderParam(sorter)
    });

    this.setState({ params: nextParams });
    this.fetch(nextParams);

    if (onChange) {
      onChange(pagination, filters, sorter);
    }
  }

  protected _nextParams = (nextProps: Props) => {
    const columnsOrParamsChanged = (
      equals(nextProps.columns, this.props.columns) ||
      equals(nextProps.params, this.props.params)
    );

    if (!columnsOrParamsChanged) {
      return;
    }

    const params = propsToParams(nextProps);

    if (equals(params, this.state.params)) {
      return;
    }

    return params;
  }

  protected _rowKey = (resource: Resource) => {
    if (resource.hasLink('self')) {
      return resource.link('self').href;
    }

    return 'unknown';
  }
}
