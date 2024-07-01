import { types, makeTotalDisplay } from './helpers/initializers.js';

const tableColumns = [
    'year',
    'month',
    'sale',
    'sale_count',
    'purchase',
    'purchase_count'
];

/**
 * Monthly total properties.
 * @typedef {Object} MonthlyTotalProperties
 * @property {number} year - Year.
 * @property {number} month - Month.
 * @property {number} sale - Sale total.
 * @property {number} sale_count - Number of sales.
 * @property {number} purchase - Purchase total.
 * @property {number} purchase_count - Number of purchases.
 */

/**
 * Monthly total.
 */
export class MonthlyTotal {
    /**
     * Identifier for monthly totals.
     * @type {string}
     * @static
     */
    static identifier = 'monthlytotals';
    /**
     * Types for monthly totals.
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
     * Month.
     * @type {number}
     */
    month;
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
     * Creates a new monthly total.
     * @param {MonthlyTotalProperties} properties - Properties.
     */
    constructor(properties) {
        this.year = properties.year;
        this.month = properties.month;
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
