// @ts-check

import { types, makeTotalDisplay } from './helpers/initializers.js';

/**
 * @typedef {import('../helpers/createClass.js').DisplayOptions} DisplayOptions
 * @typedef {import('../helpers/createClass.js').DisplayableTypes} DisplayableTypes
 * @typedef {import('../Localization.js').Localization} Localization
 */

const tableColumns = [
    'year',
    'sale',
    'sale_count',
    'purchase',
    'purchase_count'
];

/**
 * Annual total properties.
 * @typedef {Object} AnnualTotalProperties
 * @property {number} year - Year.
 * @property {number} sale - Sale total.
 * @property {number} sale_count - Number of sales.
 * @property {number} purchase - Purchase total.
 * @property {number} purchase_count - Number of purchases.
 */

/**
 * Annual total.
 */
export class AnnualTotal {
    /**
     * Identifier for annual totals.
     * @type {string}
     * @static
     */
    static identifier = 'annualtotals';
    /**
     * Types for annual totals.
     * @type {DisplayableTypes}
     * @static
     */
    static types = types;
    /**
     * Year.
     * @type {number}
     */
    year;
    /**
     * Sale total.
     * @type {number}
     */
    sale;
    /**
     * Number of sales.
     * @type {number}
     */
    sale_count;
    /**
     * Purchase total.
     * @type {number}
     */
    purchase;
    /**
     * Number of purchases.
     * @type {number}
     */
    purchase_count;
    
    /**
     * Creates a new annual total.
     * @param {AnnualTotalProperties} properties - Properties.
     */
    constructor(properties) {
        this.year = properties.year;
        this.sale = properties.sale;
        this.sale_count = properties.sale_count;
        this.purchase = properties.purchase;
        this.purchase_count = properties.purchase_count;
    }
    
    /**
     * Builds the display attributes.
     * @param {Localization} locales - Localization strings.
     * @returns {DisplayOptions} Display options.
     */
    static makeDisplay(locales) {
        return makeTotalDisplay(locales, tableColumns);
    }
}
