// @ts-check

import { types, makeTotalDisplay } from './helpers/initializers.js';

/**
 * @typedef {import('../helpers/createClass.js').DisplayOptions} DisplayOptions
 * @typedef {import('../helpers/createClass.js').DisplayableTypes} DisplayableTypes
 * @typedef {import('../Localization.js').Localization} Localization
 */

const tableColumns = [
    'appid',
    'sale',
    'sale_count',
    'purchase',
    'purchase_count'
];

/**
 * App total properties.
 * @typedef {Object} AppTotalProperties
 * @property {string} appname - App name.
 * @property {number} appid - App ID.
 * @property {number} sale - Sale total.
 * @property {number} sale_count - Number of sales.
 * @property {number} purchase - Purchase total.
 * @property {number} purchase_count - Number of purchases.
 */

/**
 * App total.
 */
export class AppTotal {
    /**
     * Identifier for app totals.
     * @type {string}
     * @static
     */
    static identifier = 'apptotals';
    /**
     * Types for app totals.
     * @type {DisplayableTypes}
     * @static
     */
    static types = types;
    /**
     * App name.
     * @type {string}
     */
    appname;
    /**
     * App ID.
     * @type {number}
     */
    appid;
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
     * Creates a new app total.
     * @param {AppTotalProperties} properties - Properties.
     */
    constructor(properties) {
        this.appname = properties.appname;
        this.appid = properties.appid;
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
