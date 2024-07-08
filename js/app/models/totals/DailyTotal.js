// @ts-check

import { types, makeTotalDisplay } from './helpers/initializers.js';

/**
 * @typedef {import('../helpers/createClass.js').DisplayOptions} DisplayOptions
 * @typedef {import('../helpers/createClass.js').DisplayableTypes} DisplayableTypes
 * @typedef {import('../Localization.js').Localization} Localization
 */

const tableColumns = [
    'date',
    'sale',
    'sale_count',
    'purchase',
    'purchase_count'
];

/**
 * Daily total properties.
 * @typedef {Object} DailyTotalProperties
 * @property {Date} date - Date.
 * @property {number} sale - Sale total.
 * @property {number} sale_count - Number of sales.
 * @property {number} purchase - Purchase total.
 * @property {number} purchase_count - Number of purchases.
 */

/**
 * Daily total.
 */
export class DailyTotal {
    /**
     * Identifier for daily totals.
     * @type {string}
     * @static
     */
    static identifier = 'dailytotals';
    /**
     * Types for daily totals.
     * @type {DisplayableTypes}
     * @static
     */
    static types = types;
    /**
     * Date.
     * @type {Date}
     */
    date;
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
     * Creates a new daily total.
     * @param {DailyTotalProperties} properties - Properties.
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
