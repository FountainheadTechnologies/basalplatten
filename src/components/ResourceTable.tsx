import React from 'react';
import Table from 'antd/lib/table';
import { TableProps } from 'antd/lib/table/Table';
import { PaginationProps } from 'antd/lib/pagination';
import { Resource } from '@optics/hal-client';
import 'antd/lib/table/style';

import { filtersToWhereParam, sorterToOrderParam, Sorter } from '../hoc/stateParamsControlledTable';

export interface Props extends TableProps<any> {
  resource: Resource;
  rel: string;
  name?: string;
  embedded?: string;
}

export interface State {
  loading: boolean;
  total: number;
  rows: Resource[];
  params: {};
}

export class ResourceTable extends React.Component<Props, State> {
  state: State = {
    loading: false,
    total: 0,
    rows: [],
    params: {}
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

  fetch = (params = this.state.params) => {
    const { resource, rel, name, embedded } = this.props;

    this.setState({ loading: true });

    const link = name ?
      resource.linkNamed(rel, name) : resource.link(rel);

    return link.fetch(params)
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
    const { columns, onChange } = this.props;

    this.setState({
      params: {
        page: pagination.current || 1,
        where: filtersToWhereParam(columns, filters),
        order: sorterToOrderParam(sorter)
      }
    }, this.fetch);

    if (onChange) {
      onChange(pagination, filters, sorter);
    }
  }
}
