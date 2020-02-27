'use strict';

import { createTotalClass } from './helpers/createTotalClass.js';

const identifier = 'annualtotals';
const tableColumns = [
    'year',
    'sale',
    'sale_count',
    'purchase',
    'purchase_count'
];
const AnnualTotal = createTotalClass(identifier, tableColumns);

export { AnnualTotal };