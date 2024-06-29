import { types, makeTotalDisplay } from './helpers/initializers.js';

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
 * @property {number} month - Month.
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
     * @type {ModelTypes}
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
     * Creates a new annual total.
     * @param {AnnualTotalProperties} properties - Properties.
     */
    constructor(properties) {
        Object.assign(this, properties);
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
