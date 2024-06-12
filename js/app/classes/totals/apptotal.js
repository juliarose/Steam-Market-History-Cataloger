import { createTotalClass } from './helpers/createTotalClass.js';

const identifier = 'apptotals';
const tableColumns = [
    'appid',
    'sale',
    'sale_count',
    'purchase',
    'purchase_count'
];
export const AppTotal = createTotalClass(identifier, tableColumns);
