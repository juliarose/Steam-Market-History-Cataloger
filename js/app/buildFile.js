import { printCSVDate, escapeCSV, omitEmpty, isNumber } from './helpers/utils.js';
import { formatMoney } from './money.js';

/**
 * @typedef {import('./currency.js').Currency} Currency
 * @typedef {import('./classes/localization.js').Localization} Localization
 */

/**
 * Gets the header name for a JSON file.
 * @param {Object} Class - Class.
 * @returns {string} Header.
 */
function getJSONHeader(Class) {
    return Class.identifier || 'items';
}

/**
 * Gets the function for a creating a CSV row.
 * @param {Object} Class - Class.
 * @param {Object} options - Options to format with.
 * @param {Currency} options.currency - Currency to format money values in.
 * @param {Localization} options.locales - Locale strings.
 * @returns {Function} Function for creating a CSV row.
 */
export function createGetCSVRow(Class, options) {
    const getRow = (record) => {
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
        
        return columns.map((column) => {
            return printItem(record, column) ;
        }).join(',');
    };
    const { locales, currency } = options;
    const classDisplay = Class.makeDisplay(locales);
    const tableDisplay = classDisplay.table || {};
    const formatDisplay = classDisplay.csv || {};
    // the currency fields for the class
    const currencyFields = classDisplay.currency_fields || [];
    // the display option to pick from
    // prioritize the specific display for this format from the class
    // then the display provided for tables
    // then the generic display properties
    const display = classDisplay.csv || classDisplay.table || classDisplay || {};
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
    
    return getRow;
}

/**
 * Gets the header for a CSV file.
 * @param {Object} Class - Class.
 * @param {Object} options - Options to format with.
 * @param {Currency} options.currency - Currency to format money values in.
 * @param {Localization} options.locales - Locale strings.
 * @returns {string} Header.
 */
export function getCSVHeader(Class, options) {
    const { locales } = options;
    const classDisplay = Class.makeDisplay(locales);
    const tableDisplay = classDisplay.table || {};
    const formatDisplay = classDisplay.csv || {};
    // the display option to pick from
    // prioritize the specific display for this format from the class
    // then the display provided for tables
    // then the generic display properties
    const display = classDisplay.csv || classDisplay.table || classDisplay || {};
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
    const getColumnName = (column) => {
        return escapeCSV((classDisplay.names || {})[column] || '');
    };
    
    return columns.map(getColumnName).join(',');
}

/**
 * Gets the template for a JSON file.
 * @param {Object} Class - The record.
 * @param {Object} options - Options to format with.
 * @param {Currency} options.currency - Currency to format money values in.
 * @param {Localization} options.locales - Locale strings.
 * @returns {Object} Record as JSON.
 */
export function getJSONTemplate(Class, options) {
    const { locales, currency } = options;
    const classDisplay = Class.makeDisplay(locales);
    // the currency fields for the class
    const currencyFields = classDisplay.currency_fields || [];
    const header = getJSONHeader(Class);
    
    return omitEmpty({
        // only include currency if currency values are included in data
        currency: currencyFields.length > 0 ? currency : null,
        // as an empty array
        [header]: []
    });
}

/**
 * Converts a record to JSON.
 * @param {Object} record - The record.
 * @returns {Object} Record as JSON.
 */
export function recordToJSON(record) {
    if (!record.toJSON) {
        return record;
    }
    
    return record.toJSON();
}

/**
 * Builds a file for the given records.
 * @param {Array} records - Records to build with.
 * @param {Object} Class - Class of records.
 * @param {Object} options - Options to format with.
 * @param {Currency} options.currency - Currency to format money values in.
 * @param {Localization} options.locales - Locale strings.
 * @param {string} format - Format to save in.
 * @returns {string} File contents, will be blank if a valid format is not supplied.
 */
export function buildFile(records, Class, options, format) {
    const get = {
        csv: function() {
            const header = getCSVHeader(Class, options);
            // create the function for getting a row
            const getCSVRow = createGetCSVRow(Class, options);
            const rows = records.map(getCSVRow);
            
            return [
                header,
                ...rows
            ].join('\n');
        },
        json: function () {
            const json = getJSONTemplate(Class, options);
            const header = getJSONHeader(Class);
            
            json[header] = records.map(recordToJSON);
            
            return JSON.stringify(json);
        }
    };
    const build = get[format];
    
    if (build === undefined) {
        return '';
    }
    
    return build();
}

/**
 * Gets the options to download to a stream.
 * @param {Object} Class - Class.
 * @param {Object} options - Options to format with.
 * @param {Currency} options.currency - Currency to format money values in.
 * @param {Localization} options.locales - Locale strings.
 * @param {string} format - Format to save in.
 * @returns {Object} Save options.
 */
export function getStreamDownloadOptions(Class, options, format) {
    const get = {
        csv: function() {
            const header = getCSVHeader(Class, options);
            // create the function for getting a row
            const getCSVRow = createGetCSVRow(Class, options);
            
            return {
                format,
                header,
                order,
                direction,
                limit,
                seperator: '\n',
                converter: getCSVRow
            };
        },
        json: function () {
            const json = getJSONTemplate(Class, options);
            // take off the closing piece
            const header = JSON.stringify(json).replace(/\]\}$/, '');
            const footer = ']}';
            
            return {
                format,
                header,
                footer,
                order,
                direction,
                limit,
                seperator: ',',
                converter: (record) => {
                    return JSON.stringify(recordToJSON(record));
                }
            };
        }
    };
    const limit = 10000;
    const { locales } = options;
    const classDisplay = Class.makeDisplay(locales);
    const { order, direction } = classDisplay.stream || {};
    const build = get[format];
    
    if (build === undefined) {
        return null;
    }
    
    return build();
}
