import { ResourceTable, Props as ResourceTableProps } from './ResourceTable';
import { stateParamsControlledTable, Props as SPCTProps } from '../hoc/stateParamsControlledTable';

export const Table: React.ComponentClass<SPCTProps> = stateParamsControlledTable<ResourceTableProps>(ResourceTable);
