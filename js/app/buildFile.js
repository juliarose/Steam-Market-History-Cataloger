import { printCSVDate, escapeCSV, omitEmpty, isNumber } from './helpers/utils.js';
import { formatMoney } from './money.js';

/**
 * @typedef {import('./classes/helpers/createClass.js').Displayable} Displayable
 * @typedef {import('./currency.js').Currency} Currency
 * @typedef {import('./classes/Localization.js').Localization} Localization
 * @typedef {import('./helpers/download.js').DownloadCollectionOptions} DownloadCollectionOptions
 */

/**
 * Gets the header name for a JSON file.
 * @param {Displayable} Displayable - Displayable.
 * @returns {string} Header.
 */
function getJSONHeader(Displayable) {
    return Displayable.identifier || 'items';
}

/**
 * Gets the function for a creating a CSV row.
 * @param {Displayable} Displayable - Displayable.
 * @param {Object} options - Options to format with.
 * @param {Currency} options.currency - Currency to format money values in.
 * @param {Localization} options.locales - Locale strings.
 * @returns {Function} Function for creating a CSV row.
 */
export function createGetCSVRow(Displayable, options) {
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
    const classDisplay = Displayable.makeDisplay(locales);
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
 * @param {Displayable} Displayable - Displayable.
 * @param {Object} options - Options to format with.
 * @param {Currency} options.currency - Currency to format money values in.
 * @param {Localization} options.locales - Locale strings.
 * @returns {string} Header.
 */
export function getCSVHeader(Displayable, options) {
    const { locales } = options;
    const classDisplay = Displayable.makeDisplay(locales);
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
 * @param {Displayable} Displayable - Displayable.
 * @param {Object} options - Options to format with.
 * @param {Currency} options.currency - Currency to format money values in.
 * @param {Localization} options.locales - Locale strings.
 * @returns {Object} Record as JSON.
 */
export function getJSONTemplate(Displayable, options) {
    const { locales, currency } = options;
    const classDisplay = Displayable.makeDisplay(locales);
    // the currency fields for the class
    const currencyFields = classDisplay.currency_fields || [];
    const header = getJSONHeader(Displayable);
    
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
 * @param {Object[]} records - Records to build with.
 * @param {Displayable} Displayable - Displayable of records.
 * @param {Object} options - Options to format with.
 * @param {Currency} options.currency - Currency to format money values in.
 * @param {Localization} options.locales - Locale strings.
 * @param {string} format - Format to save in.
 * @returns {string} File contents, will be blank if a valid format is not supplied.
 */
export function buildFile(records, Displayable, options, format) {
    switch (format) {
        case 'csv': {
            const header = getCSVHeader(Displayable, options);
            // create the function for getting a row
            const getCSVRow = createGetCSVRow(Displayable, options);
            // create the rows, leading with the header
            let rows = [header];
            
            // add the rows for each record
            rows = rows.concat(records.map(getCSVRow));
            
            return rows.join('\n');
        };
        case 'json': {
            const json = getJSONTemplate(Displayable, options);
            const header = getJSONHeader(Displayable);
            
            json[header] = records.map(recordToJSON);
            
            return JSON.stringify(json);
        };
        default:
            return '';
    }
}

/**
 * Gets the options to download to a stream.
 * @param {Displayable} displayable - Displayable.
 * @param {Object} options - Options to format with.
 * @param {Currency} options.currency - Currency to format money values in.
 * @param {Localization} options.locales - Locale strings.
 * @param {string} format - Format to save in.
 * @returns {DownloadCollectionOptions} Save options.
 */
export function getStreamDownloadOptions(Displayable, options, format) {
    const limit = 10000;
    const { locales } = options;
    const classDisplay = Displayable.makeDisplay(locales);
    const { order, direction } = classDisplay.stream || {};
    
    switch (format) {
        case 'csv': {
            const header = getCSVHeader(Displayable, options);
            // create the function for getting a row
            const getCSVRow = createGetCSVRow(Displayable, options);
            
            return {
                format,
                header,
                order,
                direction,
                limit,
                seperator: '\n',
                converter: getCSVRow
            };
        };
        case 'json': {
            const json = getJSONTemplate(Displayable, options);
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
                converter(record) {
                    return JSON.stringify(recordToJSON(record));
                }
            };
        };
        default:
            return null;
    };
}
