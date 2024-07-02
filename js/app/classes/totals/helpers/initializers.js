// @ts-check

import { applist } from '../../../data/applist.js';

/**
 * @typedef {import('../../Localization.js').Localization} Localization
 * @typedef {import('../../helpers/createClass.js').DisplayOptions} DisplayOptions
 */

export const types = {
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

/**
 * Builds the display attributes.
 * @param {Localization} locales - Localization strings.
 * @param {string[]} tableColumns - Columns to display.
 * @returns {DisplayOptions} Display options.
 */
export function makeTotalDisplay(locales, tableColumns) {
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
                month(_value, record) {
                    if (typeof record.year === 'number' && typeof record.month === 'number') {
                        // @ts-ignore
                        return moment()
                            .year(record.year)
                            .month(record.month)
                            .format('MMMM');
                    }
                    
                    return '';
                },
                appid(value) {
                    return applist[value] || value;
                }
            },
        },
        table: {
            columns: tableColumns,
            cell_value: {
                date(value) {
                    if (value instanceof Date) {
                        // @ts-ignore
                        return moment(value).format('MMMM Do, YYYY');
                    }
                    
                    return '';
                },
                month(_value, record) {
                    if (typeof record.year === 'number' && typeof record.month === 'number') {
                        // @ts-ignore
                        return moment()
                            .year(record.year)
                            .month(record.month)
                            .format('MMMM');
                    }
                    
                    return '';
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
}
