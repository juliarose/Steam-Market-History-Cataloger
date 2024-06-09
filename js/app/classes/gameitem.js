'use strict';

import { createClass } from './helpers/createClass.js';

/**
 * @typedef {import('./helpers/createClass.js').DisplayOptions} DisplayOptions
 * @typedef {import('./localization.js').Localization} Localization
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
 * @class
 * @property {string} app - App name.
 * @property {number} count - Number of this particular item.
 * @property {Date} name - Name of item.
 * @property {boolean} price - Price of item(s).
 */
export const GameItem = createClass({
    types,
    identifier: 'gameitems'
});

/**
 * Builds the display attributes.
 * @memberOf GameItem
 * @param {Localization} locales - Localization strings.
 * @returns {DisplayOptions} Display options.
 */
GameItem.makeDisplay = function(locales) {
    return {
        names: locales.db.gameitems.names,
        identifiers: locales.db.gameitems.identifiers,
        currency_fields: [
            'price'
        ],
        number_fields: [
            'price'
        ],
        boolean_fields: []
    };
};

// this represents the class when exporting to JSON
GameItem.prototype.toJSON = function() {
    return {
        app: this.app,
        count: this.count,
        name: this.name,
        price: this.price
    };
};