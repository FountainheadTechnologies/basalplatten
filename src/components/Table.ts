import { ResourceTable, Props as ResourceTableProps } from './ResourceTable';
import { stateParamsControlledTable, Props as SPCTProps } from '../hoc/stateParamsControlledTable';

export { SPCTProps, ResourceTableProps };

export const Table = stateParamsControlledTable(ResourceTable);
