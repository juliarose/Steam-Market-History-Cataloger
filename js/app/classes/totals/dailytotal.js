'use strict';

import { createTotalClass } from './helpers/createTotalClass.js';

const identifier = 'dailytotals';
const tableColumns = [
    'date',
    'sale',
    'sale_count',
    'purchase',
    'purchase_count'
];
const DailyTotal = createTotalClass(identifier, tableColumns);

export { DailyTotal };