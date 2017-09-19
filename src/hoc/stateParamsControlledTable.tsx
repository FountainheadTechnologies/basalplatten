import React from 'react';
import PropTypes from 'prop-types';
import { UIRouterReact } from '@uirouter/react';
import { TableProps } from 'antd/lib/table/Table';
import { ColumnProps } from 'antd/lib/table/Column';
import { PaginationProps } from 'antd/lib/pagination';
import 'antd/lib/table/style';

import { stateParamsObserver } from '../hoc/stateParamsObserver';

const SORT_TO_ORDER = {
  ascend: 'asc',
  descend: 'desc'
};

const ORDER_TO_SORT = {
  asc: 'ascend',
  desc: 'descend'
};

export interface Props<T> {
  defaultPageSize: number;
  wrappedComponentRef?: (ref: React.Component<T>) => void;
}

export interface StateParamsProps {
  stateParams?: {
    page: number;
    where: {
      [key: string]: any
    }
    order: {
      [key: string]: 'asc' | 'desc'
    }
  }
}

export interface Sorter {
  column: ColumnProps<any>;
  columnKey?: string;
  field: string;
  order: 'ascend' | 'descend';
}

export interface State {
  pagination: PaginationProps
}

export interface Context {
  router: UIRouterReact
}

export const filtersToWhereParam = (columns: ColumnProps<any>[] | undefined, filters: { [key: string]: string | string[] }) => {
  if (!columns) {
    return;
  }

  const result: { [key: string]: string | string[] } = {};

  Object.keys(filters).forEach(key => {
    const column = columns.find(column => (
      column.key === key || column.dataIndex === key
    ));

    if (!column) {
      return;
    }

    const values = filters[key];
    if (!values.length) {
      return;
    }

    result[key] = column.filterMultiple ? values : values[0];
  });

  return result;
}

export const sorterToOrderParam = (sorter: Sorter) => {
  if (!sorter.columnKey) {
    return;
  }

  return {
    [sorter.columnKey]: SORT_TO_ORDER[sorter.order]
  }
}

export const stateParamsControlledTable =
  <P extends TableProps<any>>(Component: React.ComponentClass<P>): React.ComponentClass<P & Props<P>> => {
    class StateParamsControlledTable extends React.Component<TableProps<any> & Props<P> & StateParamsProps> {
      static contextTypes = {
        router: PropTypes.object
      }

      context: Context;

      state: State = {
        pagination: {
          pageSize: this.props.defaultPageSize,
          current: 1,
          total: 0
        }
      }

      render() {
        const {
          stateParams,
          defaultPageSize,
          columns,
          ...tableProps
        } = this.props;

        const pagination = tableProps.pagination === false ?
          false : this.state.pagination;

        return (
          <Component
            {...tableProps as P}
            columns={this.transformColumns(columns || [])}
            onChange={this.onChange}
            pagination={pagination}
            ref={this.props.wrappedComponentRef}
          />
        );
      }

      componentWillReceiveProps(nextProps: Props<P> & StateParamsProps) {
        if (!nextProps.stateParams || !nextProps.stateParams.page) {
          return;
        }

        const updatePage = (
          (!this.props.stateParams || !this.props.stateParams.page) ||
          (this.props.stateParams.page !== nextProps.stateParams.page)
        );

        if (updatePage) {
          this.setState({
            pagination: {
              ...this.state.pagination,
              current: nextProps.stateParams.page
            }
          })
        }
      }

      /**
       * Ant type declaration of `filters` is wrong; should be {[key: string]:
       * string[]}, so uses explicit `any` instead.
       *
       * `filtersToWhereParam` uses correct type.
       */
      onChange = (pagination: PaginationProps, filters: any, sorter: Sorter) => {
        const { columns, onChange } = this.props;

        this.context.router.stateService
          .go('.', {
            page: pagination.current,
            where: filtersToWhereParam(columns, filters),
            order: sorterToOrderParam(sorter)
          });

        if (onChange) {
          onChange(pagination, filters, sorter);
        }
      }

      transformColumns = (columns: ColumnProps<any>[]): ColumnProps<any>[] =>
        columns.map(column => ({
          ...column,
          filteredValue: this.whereParamToFilteredValue(column),
          sortOrder: this.orderParamToSortOrder(column)
        }))

      whereParamToFilteredValue = (column: ColumnProps<any>) => {
        if (!this.props.stateParams) {
          return [];
        }

        const { where } = this.props.stateParams;
        const key = column.key || column.dataIndex;

        if (!where || !key) {
          return [];
        }

        const value = where[key];

        if (!value) {
          return [];
        }

        return value instanceof Array ? value : [value];
      }

      orderParamToSortOrder = (column: ColumnProps<any>) => {
        if (!this.props.stateParams) {
          return;
        }

        const { order } = this.props.stateParams;
        const key = column.key || column.dataIndex;

        if (!order || !key) {
          return;
        }

        const direction = order[key];

        if (!direction) {
          return;
        }

        return ORDER_TO_SORT[direction] as 'ascend' | 'descend';
      }
    }

    return stateParamsObserver(
      StateParamsControlledTable as any,
      (stateParams, props: any) => ({
        ...props,
        stateParams
      })
    );
  }
