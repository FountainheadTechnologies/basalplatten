import React from 'react';
import PropTypes from 'prop-types';
import { UIRouterReact } from '@uirouter/react';
import { TableProps, TableColumnConfig } from 'antd/lib/table/Table';
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

export interface Props<T> extends TableProps<T> {
  defaultPageSize: number;
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
  column: TableColumnConfig<any>;
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

export type StateParamsControlledTable =
  <T>(Component: React.ComponentType<TableProps<T>>) =>
    React.ComponentClass<Props<T>>;

export const stateParamsControlledTable: StateParamsControlledTable =
  (Component) => {
    class StateParamsControlledTable extends React.Component<Props<any> & StateParamsProps> {
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
            {...tableProps}
            columns={this.transformColumns(columns || [])}
            onChange={this.onChange}
            pagination={pagination}
          />
        );
      }

      componentWillReceiveProps(nextProps: Props<any> & StateParamsProps) {
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
        this.context.router.stateService
          .go('.', {
            page: pagination.current,
            where: this.filtersToWhereParam(filters),
            order: this.sorterToOrderParam(sorter)
          });

        if (this.props.onChange) {
          this.props.onChange(pagination, filters, sorter);
        }
      }

      filtersToWhereParam = (filters: { [key: string]: string | string[] }) => {
        const result: { [key: string]: string | string[] } = {};

        Object.keys(filters).forEach(key => {
          if (!this.props.columns) {
            return;
          }

          const column = this.props.columns.find(column => (
            column.key === key || column.dataIndex === key
          ));

          if (!column) {
            return;
          }

          const values = filters[key];
          result[key] = column.filterMultiple ? values : values[0];
        });

        return result;
      }

      sorterToOrderParam = (sorter: Sorter) => {
        if (!sorter.columnKey) {
          return;
        }

        return {
          [sorter.columnKey]: SORT_TO_ORDER[sorter.order]
        }
      }

      transformColumns = (columns: TableColumnConfig<any>[]): TableColumnConfig<any>[] =>
        columns.map(column => ({
          ...column,
          filteredValue: this.whereParamToFilteredValue(column),
          sortOrder: this.orderParamToSortOrder(column)
        }))

      whereParamToFilteredValue = (column: TableColumnConfig<any>) => {
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

      orderParamToSortOrder = (column: TableColumnConfig<any>) => {
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
      StateParamsControlledTable,
      (stateParams, props: any) => ({
        ...props,
        stateParams
      })
    );
  }
