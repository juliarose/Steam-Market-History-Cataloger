// @ts-check

import { ETransactionType } from '../enums/ETransactionType.js';

/**
 * @typedef {import('./helpers/createClass.js').DisplayOptions} DisplayOptions
 * @typedef {import('./helpers/createClass.js').DisplayableTypes} DisplayableTypes
 * @typedef {import('./Localization.js').Localization} Localization
 */

/**
 * Account transaction properties.
 * @typedef {Object} AccountTransactionProperties
 * @property {string} [transaction_id] - Transaction ID, if available.
 * @property {number} transaction_type - Transaction type given fom ETransactionType.
 * @property {Date} date - Date of transaction.
 * @property {number} count - Number of this type of transaction.
 * @property {number} price - Total price.
 * @property {string} price_raw - Raw stirng of price.
 * @property {boolean} is_credit - Whether the transaction resulted in credit or not.
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
 */
export class AccountTransaction {
    /**
     * Identifier for account transactions.
     * @type {string}
     * @static
     */
    static identifier = 'accounttransactions';
    /**
     * Primary key for account transactions.
     * @type {string}
     * @static
     */
    static primary_key = 'transaction_id';
    /**
     * Types for listings.
     * @type {DisplayableTypes}
     * @static
     */
    static types = types;
    /**
     * Transaction ID, if available.
     * @type {(string | undefined)}
     */
    transaction_id;
    /**
     * Transaction type given from ETransactionType.
     * @type {number}
     */
    transaction_type;
    /**
     * Date of transaction.
     * @type {Date}
     */
    date;
    /**
     * Number of this type of transaction.
     * @type {number}
     */
    count;
    /**
     * Total price.
     * @type {number}
     */
    price;
    /**
     * Raw string of price.
     * @type {string}
     */
    price_raw;
    /**
     * Whether the transaction resulted in credit or not.
     * @type {boolean}
     */
    is_credit;
    
    /**
     * Account transaction.
     * @param {AccountTransactionProperties} properties - Account transaction properties.
     */
    constructor(properties) {
        this.transaction_id = properties.transaction_id;
        this.transaction_type = properties.transaction_type;
        this.date = properties.date;
        this.count = properties.count;
        this.price = properties.price;
        this.price_raw = properties.price_raw;
        this.is_credit = properties.is_credit;
    }
    
    /**
     * Builds the display attributes.
     * @static
     * @param {Localization} locales - Localization strings.
     * @returns {DisplayOptions} Display options.
     */
    static makeDisplay(locales) {
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
                    transaction_type(value) {
                        if (typeof value === 'string' || typeof value === 'number') {
                            const transactionType = ETransactionType[value];
                            
                            if (transactionType) {
                                return transactionType.toString();
                            }
                            
                            return value.toString();
                        }
                        
                        return '';
                    }
                }
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
                    is_credit(value) {
                        if (value) {
                            return '+';
                        } else {
                            return '-';
                        }
                    },
                    transaction_type(value) {
                        if (typeof value === 'string' || typeof value === 'number') {
                            const transactionType = locales.db.accounttransactions.identifiers.transaction_type[value];
                            
                            if (transactionType) {
                                return transactionType.toString();
                            }
                            
                            return value.toString();
                        } else if (value != null) {
                            return value.toString();
                        }
                        
                        return '';
                    }
                }
            }
        };
    }
    
    /**
     * Converts account transaction to JSON format.
     * @returns {Object} JSON representation of the account transaction.
     */
    toJSON() {
        return {
            date: this.date,
            transaction_type: this.transaction_type,
            is_credit: this.is_credit,
            price: this.price,
            count: this.count
        };
    }
}