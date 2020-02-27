'use strict';

import { printCSVDate, escapeCSV, omitEmpty, isNumber } from './helpers/utils.js';
import { formatMoney } from './money.js';

/**
 * Builds a file for the given records.
 * @param {Array} records - Records to build with.
 * @param {Object} Class - Class of records.
 * @param {Object} options - Options to format with.
 * @param {Currency} options.currency - Currency to format money values in.
 * @param {String} format - Format to save in.
 * @returns {String} File contents, will be blank if a valid format is not supplied.
 */
function buildFile(records, Class, options, format) {
    const classDisplay = Class.display || {};
    const tableDisplay = classDisplay.table || {};
    const formatDisplay = classDisplay[format] || {};
    // the display option to pick from
    // prioritize the specific display for this format from the class
    // then the display provided for tables
    // then the generic display properties
    const display = classDisplay[format] || classDisplay.table || Class.display || {};
    // the currency fields for the class
    const currencyFields = classDisplay.currency_fields || [];
    // the currency to format in
    const currency = options.currency;
    const get = {
        csv: function() {
            // it'll try its best to display the item
            const printItem = (record, key) => {
                const format = (value) => {
                    if (value === null || value === undefined) {
                        return '';
                    } else if (value instanceof Date) {
                        return printDate(value);
                    } else if (currencyFields.indexOf(key) !== -1) {
                        // print money values in decimal format
                        return escapeCSV(formatMoney(value, currency));
                    } else if (isNumber(value)) {
                        // as-is
                        return value;
                    } else {
                        // escape string
                        return escapeCSV(value);
                    }
                };
                
                const formatter = formatters[key];
                let value = record[key];
                
                if (formatter) {
                    value = formatter(value, record);
                }
                
                return format(value);
            };
            const getHeading = () => {
                const getColumnName = (column) => {
                    return escapeCSV((classDisplay.names || {})[column] || '');
                };
                
                return columns.map(getColumnName).join(',');
            };
            const getRow = (record) => {
                return columns.map((column) => {
                    return printItem(record, column) ;
                }).join(',');
            };
            
            // keep searching through display options until a "columns" value is found
            // in this particular order
            const columns = (
                // format options take highest priority
                (formatDisplay.columns) ||
                // then table
                (tableDisplay.columns) ||
                // then anything found in the display object
                (display.columns)
            ) || [];
            const printDate = printCSVDate;
            const formatters = display.cell_value || {};
            
            return [getHeading()].concat(records.map(getRow)).join('\n');
        },
        json: function () {
            return JSON.stringify(omitEmpty({
                // only include currency if currency values are included in data
                currency: currencyFields.length > 0 ? currency : null,
                items: records.map((record) => {
                    return record.toJSON ? record.toJSON() : record;
                })
            }));
        }
    };
    const build = get[format];
    
    if (build !== undefined) {
        return build();
    } else {
        return '';
    }
}

export { buildFile };