// @ts-check

// Unused - this falls under account transactions but is not implemented currently.

/**
 * @typedef {import('./helpers/createClass.js').Displayable} Displayable
 * @typedef {import('./helpers/createClass.js').DisplayOptions} DisplayOptions
 * @typedef {import('./helpers/createClass.js').DisplayableTypes} DisplayableTypes
 * @typedef {import('./Localization.js').Localization} Localization
 */

/**
 * Game item properties.
 * @typedef {Object} GameItemProperties
 * @property {string} app - App name.
 * @property {number} count - Number of this particular item.
 * @property {string} name - Name of item.
 * @property {number} price - Price of item(s).
 */

const types = {
    app: String,
    count: Number,
    name: String,
    price: Number
};

/**
 * Game item.
 * @namespace GameItem
 */
export class GameItem {
    /**
     * Identifier for game items.
     * @type {string}
     * @static
     */
    static identifier = 'gameitems';
    /**
     * Types for game items.
     * @type {DisplayableTypes}
     * @static
     */
    static types = types;
    /**
     * App name.
     * @type {string}
     */
    app;
    /**
     * Number of this particular item.
     * @type {number}
     */
    count;
    /**
     * Name of item.
     * @type {string}
     */
    name;
    /**
     * Price of item(s).
     * @type {number}
     */
    price;
    
    /**
     * Creates a new game item.
     * @param {GameItemProperties} properties - Properties.
     */
    constructor(properties) {
        this.app = properties.app;
        this.count = properties.count;
        this.name = properties.name;
        this.price = properties.price;
    }
    
    /**
     * Builds the display attributes.
     * @static
     * @param {Localization} locales - Localization strings.
     * @returns {DisplayOptions} Display options.
     */
    static makeDisplay(locales) {
        return {
            names: locales.db.gameitems.names,
            identifiers: {},
            currency_fields: [
                'price'
            ],
            number_fields: [
                'price'
            ],
            boolean_fields: []
        };
    };
    
    /**
     * Converts game item to JSON format.
     * @returns {Object} JSON representation of the game item.
     */
    toJSON = function() {
        return {
            app: this.app,
            count: this.count,
            name: this.name,
            price: this.price
        };
    };
}