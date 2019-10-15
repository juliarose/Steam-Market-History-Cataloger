'use strict';

import {createClass} from '../../helpers/createClass.js';
import {applist} from '../../../data/applist.js';

/**
 * Creates a new class for data related to totals.
 * @param {String} identifier - Identifier of class.
 * @param {Array} tableColumns - Columns to display.
 * @returns {Object} Class object.
 */
function createTotalClass(identifier, tableColumns) {
    const types = {
        year: Number,
        month: Number,
        appid: String,
        appname: String,
        date: Date,
        sale: Number,
        sale_count: Number,
        purchase: Number,
        purchase_count: Number
    };
    const Class = createClass({
        types,
        identifier
    });
    
    Class.makeDisplay = function(locales) {
        const names = locales.ui.names;
        
        return {
            names,
            currency_fields: [
                'sale',
                'purchase'
            ],
            number_fields: [
                'year',
                'month',
                'sale',
                'purchase'
            ],
            csv: {
                cell_value: {
                    month: function(value, record) {
                        return moment()
                            .year(record.year)
                            .month(record.month)
                            .format('MMMM');
                    },
                    appid: function(value) {
                        return applist[value] || value;
                    }
                },
            },
            table: {
                columns: tableColumns,
                cell_value: {
                    date: function(value) {
                        return moment(value).format('MMMM Do, YYYY');
                    },
                    month: function(value, record) {
                        return moment()
                            .year(record.year)
                            .month(record.month)
                            .format('MMMM');
                    },
                    appid: function(value) {
                        return applist[value] || value;
                    }
                },
                column_names: names,
                column_class: {
                    year: [
                        'year'
                    ],
                    sale: [
                        'price',
                        'more'
                    ],
                    sale_count: [
                        'number'
                    ],
                    purchase: [
                        'price',
                        'more'
                    ],
                    purchase_count: [
                        'number'
                    ]
                },
                sorts: {
                    year: 'year',
                    month: 'month',
                    // sort by appname instead
                    appid: 'appname',
                    date: 'date',
                    sale: 'sale',
                    sale_count: 'sale_count',
                    purchase: 'purchase',
                    purchase_count: 'purchase_count'
                }
            }
        };
    };
    
    return Class;
}

export {createTotalClass};