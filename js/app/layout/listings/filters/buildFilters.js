// @ts-check

import { stringToDate } from '../../../helpers/utils.js';
import { drawFilters } from './drawFilters.js';

/**
 * @typedef {import('../../../models/helpers/createClass.js').Displayable} Displayable
 * @typedef {import('../../../models/Localization.js').Localization} Localization
 */

/**
 * @typedef {Object} WhereQuery
 * @property {string} field - Field to query.
 * @property {string} key - Key for comparison.
 * @property {Function} converter - Function.
 */

/**
 * Queries that require a `where` clause.
 * @type {Object.<string, WhereQuery>}
 */
const WhereQueries = {
    after_date: {
        field: 'date_acted',
        key: 'aboveOrEqual',
        converter: stringToDate,
    },
    before_date: {
        field: 'date_acted',
        key: 'belowOrEqual',
        converter: stringToDate,
    }
};

/**
 * Function for comparing two values.
 * @typedef {function((number|string|null), (number|string|null)): boolean} ComparisonFunction
*/

/**
 * @typedef WhereQueryDetails
 * @property {string} field - HTML field name for key.
 * @property {string} key - Key of function to call on Dexie collection.
 * @property {ComparisonFunction} compare - Comparison function.
 * @property {*} convertedValue - Converted value.
 */

/**
 * Gets details for a where query.
 * @param {string} k - Key.
 * @param {Object.<string, *>} query - Query.
 * @returns {WhereQueryDetails} Details.
 */
function getWhereQueryDetails(k, query) {
    const value = query[k];
    const { field, key, converter } = WhereQueries[k];
    let convertedValue = value;
    
    // If a converter is defined, convert the value
    if (converter) {
        convertedValue = converter(value);
    }
    
    // comparison functions
    const compare = {
        /**
         * Selects elements above.
         * @type {ComparisonFunction}
         */
        above(a, b) {
            return Boolean(
                a &&
                b &&
                a > b
            );
        },
        /**
         * Selects elements below.
         * @type {ComparisonFunction}
         */
        below(a, b) {
            return Boolean(
                a &&
                b &&
                a < b
            );
        },
        /**
         * Selects elements above or equal.
         * @type {ComparisonFunction}
         */
        aboveOrEqual(a, b) {
            return Boolean(
                a &&
                b &&
                a >= b
            );
        },
        /**
         * Selects elements below or equal.
         * @type {ComparisonFunction}
         */
        belowOrEqual(a, b) {
            return Boolean(
                a &&
                b &&
                a <= b
            );
        },
        /**
         * Selects elements that are equal.
         * @type {ComparisonFunction}
         */
        equals(a, b) {
            return a === b;
        }
    }[key];
    
    return {
        field,
        key,
        compare,
        convertedValue
    };
}

/**
 * Function to call on filter change.
 * @typedef {function(Object[], Object): void} OnChangeFunction
*/

/**
 * Builds filters for listings.
 * @param {Object} table - Table to draw filters for.
 * @param {Object[]} records - Records to draw filters from.
 * @param {Displayable} Displayable - Displayable.
 * @param {Object} options - Options.
 * @param {Localization} options.locales - Locale strings.
 * @param {number} options.limit - Query limit.
 * @param {OnChangeFunction} options.onChange - Function to call on filter change.
 * @returns {Promise<DocumentFragment>} DOM element.
 */
export async function buildFilters(table, records, Displayable, options) {
    /**
     * Updates filter queries.
     * @returns {Promise<void>} Resolves when done.
     */
    async function updateQuery() {
        // obtain a collection without a .where clause
        function noQuery() {
            const collection = table.orderBy('index');
            
            onChange(filteredRecords, collection);
        }
        
        // obtain a collection using a query
        async function doQuery() {
            queryId += 1;
            
            // the current query id
            const currentQueryId = queryId;
            // we clone the query
            const baseQuery = {
                ...query
            };
            
            // then remove all special keys to form the base query
            // of all keys that are exact values
            // everything except dates where math must be done
            Object.keys(WhereQueries)
                .forEach((k) => {
                    delete baseQuery[k];
                });
            
            let collection;
            
            // begin the query
            if (Object.keys(baseQuery).length > 0) {
                collection = table.where(baseQuery);
            }
            
            // add compounds
            let whereQueryKeys = Object.keys(query)
                // filter to only keys where a compound exists
                .filter((k) => {
                    return WhereQueries[k] !== undefined;
                });
            
            // collection is not defined
            if (whereQueryKeys.length > 0 && collection === undefined) {
                // take the first key and remove it from the array
                const k = whereQueryKeys.shift();
                
                if (typeof k === 'string') {
                    const {
                        field,
                        key,
                        convertedValue
                    } = getWhereQueryDetails(k, query);
                    
                    collection = table.where(field)[key](convertedValue);
                }
            }
            
            // create a comparison function for each where query key
            const comparisons = whereQueryKeys
                .map((k) => {
                    const {
                        field,
                        compare,
                        convertedValue
                    } = getWhereQueryDetails(k, query);
                    
                    return (record) => {
                        return compare(record[field], convertedValue);
                    };
                });
            
            if (comparisons.length > 0) {
                // and check that each comparison matches
                collection = collection.and((record) => {
                    return comparisons.every((compare) => {
                        return compare(record);
                    });
                });
            }
            
            // fetch the records
            const queriedRecords = await collection.clone().limit(limit).sortBy('index');
            
            // if the query has changed, we don't want to update
            if (currentQueryId !== queryId) {
                return;
            }
            
            // update the filtered records
            // reverse is used, I believe it's faster than sorting in the database
            filteredRecords = queriedRecords.reverse();
            
            onChange(filteredRecords, collection);
        }
        
        if (Object.keys(query).length === 0) {
            // no query is necessary to complete this
            return noQuery();
        }
        
        return doQuery();
    }
    
    /**
     * Adds a query to the filter.
     * @param {string} key - Key.
     * @param {*} value - Value.
     */
    function addQuery(key, value) {
        // If we only want to update one field...
        // let only;
        
        // if (query[key] === value) {
        //     // nothing to be done
        //     return;
        // } else if (query[key] !== undefined) {
        //     // reset when re-assigning filters
        //     filteredRecords = totalRecords;
        // } else {
        //     // we are adding a key
        //     only = key;
        // }
        
        if (key === 'is_credit') {
            value = parseInt(value);
        }
        
        query[key] = value;
        
        updateQuery();
    }
    
    /**
     * Removes a query from the filter.
     * @param {string} key - Key.
     */
    function removeQuery(key) {
        delete query[key];
        
        filteredRecords = totalRecords;
        updateQuery();
    }
    
    /**
     * Adds a query to the filter.
     * @param {string} key - Key.
     * @param {*} value - Value.
     */
    function queryChange(key, value) {
        addQuery(key, value);
    }
    
    const { limit, locales, onChange } = options;
    // the function called on filter change
    // create a copy of the records to filter from
    const totalRecords = records.slice(0);
    let queryId = 0;
    // current filter query
    // this is a map where the key is the field and the value is the query
    // for example: { market_name: 'Strange Pain Train' }
    let query = {};
    // currently filtered records
    let filteredRecords = totalRecords;
        
    return drawFilters(table, locales, Displayable, {
        queryChange,
        removeQuery
    });
}
