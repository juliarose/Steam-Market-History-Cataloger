import { createTotalClass } from './helpers/createTotalClass.js';

const identifier = 'dailytotals';
const tableColumns = [
    'date',
    'sale',
    'sale_count',
    'purchase',
    'purchase_count'
];

export const DailyTotal = createTotalClass(identifier, tableColumns);
