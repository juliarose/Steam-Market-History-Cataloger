'use strict';

import { createTotalClass } from './helpers/createTotalClass.js';

const identifier = 'apptotals';
const tableColumns = [
    'appid',
    'sale',
    'sale_count',
    'purchase',
    'purchase_count'
];
const AppTotal = createTotalClass(identifier, tableColumns);

export { AppTotal };