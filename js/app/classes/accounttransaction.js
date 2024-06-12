import { createClass } from './helpers/createClass.js';
import { ETransactionType } from '../enums/ETransactionType.js';

/**
 * @typedef {import('./helpers/createClass.js').DisplayOptions} DisplayOptions
 * @typedef {import('./localization.js').Localization} Localization
 */

const types = {
    transaction_id: String,
    transaction_type: Number,
    date: Date,
    count: Number,
    price: Number,
    price_raw: String,
    is_credit: Boolean
};

/**
 * Account transaction.
 * @namespace AccountTransaction
 * @class
 * @property {string} [transaction_id] - Transaction ID, if available.
 * @property {number} transaction_type - Transaction type given fom ETransactionType.
 * @property {Date} date - Date of transaction.
 * @property {number} count - Number of this type of transaction.
 * @property {number} price - Total price.
 * @property {string} price_raw - Raw stirng of price.
 * @property {boolean} is_credit - Whether the transaction resulted in credit or not.
 */
export const AccountTransaction = createClass({
    types,
    identifier: 'accounttransactions',
    primary_key: 'transaction_id'
});

/**
 * Builds the display attributes.
 * @memberOf AccountTransaction
 * @param {Localization} locales - Localization strings.
 * @returns {DisplayOptions} Display options.
 */
AccountTransaction.makeDisplay = function(locales) {
    return {
        names: locales.db.accounttransactions.names,
        identifiers: locales.db.accounttransactions.identifiers,
        currency_fields: [
            'price'
        ],
        boolean_fields: [
            'is_credit'
        ],
        number_fields: [
            'transaction_type',
            'is_credit',
            'price'
        ],
        csv: {
            columns: [
                'date',
                'transaction_type',
                'is_credit',
                'price',
                'count'
            ],
            cell_value: {
                transaction_type: function(value) {
                    return ETransactionType[value] || value;
                }
            }
        },
        json: {
            columns: [
                'date',
                'transaction_type',
                'is_credit',
                'price',
                'count'
            ]
        },
        table: {
            column_names: locales.db.accounttransactions.column_names,
            columns: [
                'is_credit',
                'transaction_type',
                'price',
                'date'
            ],
            sorts: {
                transaction_type: 'transaction_type',
                price: 'price',
                is_credit: 'is_credit',
                date: 'date'
            },
            row_class: function(record) {
                if (record.is_credit) {
                    return [
                        'gain'
                    ];
                } else {
                    return [
                        'loss'
                    ];
                }
            },
            column_class: {
                is_credit: [
                    'center',
                    'cond',
                    'sale-type'
                ],
                date: [
                    'date'
                ],
                price: [
                    'price'
                ]
            },
            cell_value: {
                is_credit: function(value) {
                    if (value) {
                        return '+';
                    } else {
                        return '-';
                    }
                },
                transaction_type: function(value) {
                    return locales.db.accounttransactions.identifiers.transaction_type[value] || value;
                }
            }
        }
    };
};

// this represents the class when exporting to JSON
AccountTransaction.prototype.toJSON = function() {
    return {
        date: this.date,
        transaction_type: this.transaction_type,
        is_credit: this.is_credit,
        price: this.price,
        count: this.count
    };
};
