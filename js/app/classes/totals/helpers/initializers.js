import { applist } from '../../../data/applist.js';

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
                month: function(_value, record) {
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
    }
}
