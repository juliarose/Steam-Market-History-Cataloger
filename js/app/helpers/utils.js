// @ts-check

// Utilities used throughout app

import { parseFromString } from '../../lib/dom-parser.js';

/**
 * Sleeps for a set amount of time.
 * @param {number} [time=1000] - Time in ms to delay.
 * @returns {Promise<void>} Promise that resolves after the given delay.
 */
export async function sleep(time = 1000) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

/**
 * Converts a string to a date.
 * @param {string} str - String to convert. 
 * @returns {Date} Date.
 */
export function stringToDate(str) {
    return new Date(str);
}

/**
 * Prints a date as a string.
 * @param {Date} date - Date to print.
 * @param {string} [separator='/'] - Separator used between numbers.
 * @returns {string} String of date.
 */
export function printDate(date, separator = '/') {
    return [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
    ].join(separator);
}

/**
 * Prints a date for a CSV file in the format 'YYYY-MM-DD'.
 * @param {Date} date - Date to print.
 * @returns {string} String of date to be inserted into a CSV cell.
 * 
 * @example
 * const date = Date.parse('04 Dec 1995 00:12:00 GMT');
 * const printed = printCSVDate(date); // '1995-04-12'
 */
export function printCSVDate(date) {
    return [
        date.getFullYear().toString(),
        date.getDate().toString(),
        (date.getMonth() + 1).toString()
    ].join('-');
}

/**
 * Super basic omitEmpty function.
 * @param {Object} obj - Object to omit values from.
 * @returns {Object} Object with null, undefined, or empty string values omitted.
 */
export function omitEmpty(obj) {
    let result = {};
    
    for (let k in obj) {
        if (obj[k] != null && obj[k] !== '') {
            result[k] = obj[k];
        }
    }
    
    return result;
}

/**
 * Gets difference between two arrays.
 * @param {Array} arr1 - First array.
 * @param {Array} arr2 - Second array.
 * @returns {Array} Array with values removed.
 */
export function difference(arr1, arr2) {
    return arr1.filter((a) => {
        return arr2.indexOf(a) === -1;
    });
}

/**
 * Partitions array based on conditions.
 * @template T
 * @param {T[]} arr - Array.
 * @param {function(T): boolean} method - Function to satisfy.
 * @returns {[T[], T[]]} Partitioned array.
 */
export function partition(arr, method) {
    // create an array with two empty arrays to be filled
    /** @type {[T[], T[]]} */
    let result = [
        // for truthy values
        [],
        // for falsy values
        []
    ];
    
    for (let i = 0; i < arr.length; i++) {
        let index = method(arr[i]) ? 0 : 1;
        
        result[index].push(arr[i]);
    }
    
    return result;
}

/**
 * Groups an array by value from key.
 * @template T
 * @param {T[]} arr - Array.
 * @param {(string | function(T): string | number)} key - Key to take value from.
 * @returns {Object} Object of groups.
 */
export function groupBy(arr, key) {
    return arr.reduce((group, item) => {
        if (typeof key === 'function') {
            const value = key(item);
            (group[value] = group[value] || []).push(item);
        } else {
            const value = item[key];
            (group[value] = group[value] || []).push(item);
        }
        
        return group;
    }, {});
}

/**
 * Averages an array of values.
 * @param {Array} values - Array of values.
 * @returns {number} Average of all values in array.
 */
export function arrAverage(values) {
    if (values.length === 0) return 0;
    
    return values.reduce((a,b) => a + b) / values.length;
}

/**
 * Flattens an array.
 * @param {Array} arr - Array to flatten.
 * @param {boolean} [deep] - Recursive flatten?
 * @returns {Array} Flattened array.
 */
export function flatten(arr, deep) {
    return arr.reduce((result, value) => {
        if (Array.isArray(value)) {
            if (deep) {
                return [...result, ...flatten(value, deep)];
            } else {
                return [...result, ...value];
            }
        } else {
            return [...result, value];
        }
    }, []);
}

/**
 * Removes all falsy values from an array.
 * @param {Array} arr - Array to compact.
 * @returns {Array} Compacted array.
 */
export function compact(arr) {
    return arr.filter(value => value);
}

/**
 * Flattens and compacts array.
 * @param {Array} arr - Array to flatten and compact.
 * @param {boolean} [deep] - Whether the array should be flattened recursively.
 * @returns {Array} Flattened and compacted array.
 */
export function flattenCompact(arr, deep) {
    return compact(flatten(arr, deep));
}

/**
 * Create a random string.
 * @param {number} [length=10] - Length of string.
 * @returns {string} Random string.
 */
export function randomString(length = 10) {
    let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');
    let count = characters.length;
    let str = '';
    
    for (let i = 0; i < length; i++) {
        str += characters[Math.floor(Math.random() * count)];
    }
    
    return str;
}

/**
 * Picks keys from an object.
 * @param {Object} object - Object to pick values from.
 * @param {Array} keys - Array of keys to pick.
 * @returns {Object} Object with picked keys.
 */
export function pickKeys(object, keys) {
    let result = {};
    
    for (let i = 0; i < keys.length; i++) {
        result[keys[i]] = object[keys[i]];
    }
    
    return result;
}

/**
 * Converts query object to string.
 * @param {Object} query - Object.
 * @returns {string} Query string.
 */
export function queryString(query) {
    /**
     * Get query parameter for value.
     * @param {string} name - Name of value.
     * @param {*} value - Value.
     * @returns {(string | Array)} Query parameter.
     */
    function getQuery(name, value) {
        if (Array.isArray(value)) {
            return value.map((subvalue) => {
                return getQuery(name + '%5B%5D', subvalue);
            });
        } else if (typeof value === 'object') {
            return Object.keys(value).map((subname) => {
                return getQuery(`${name}%5B${encode(subname)}%5D`, value[subname]);
            });
        } else {
            return name + '=' + encode(value);
        }
    }
    
    let encode = encodeURIComponent;
    
    return flatten(Object.keys(query).map((name) => {
        return getQuery(encode(name), query[name]);
    }), true).join('&');
}

/**
 * Creates a tree within an object.
 *
 * Modifies the original object.
 * @param {Object} obj - Object to build tree on.
 * @param {Array} tree - Tree to build on 'obj'.
 * @param {*} [ender] - Any value to use as the end value.
 * @returns {Object} The same object passed as 'obj'.
 *
 * @example
 * createTree({}, ['fruit', 'color'], 'red'); // { fruit: { color: 'red' } }
 */
export function createTree(obj, tree, ender) {
    let current = obj;
    
    for (let i = 0; i < tree.length; i++) {
        let key = tree[i];
        
        // check that the key is present
        if (!(key in current)) {
            if (tree.length - 1 === i) {
                current[key] = ender;
            } else {
                current[key] = {};
            }
        }
        
        current = current[key];
    }
    
    return obj;
}

/**
 * Checks if a value is a number or not.
 * @param {*} value - Value to test.
 * @returns {boolean} Whether the value is a number or not.
 */
export function isNumber(value) {
    const num = parseFloat(value);
    
    return !isNaN(num) && isFinite(num);
}

/**
 * Truncates a string with option to add trail at end.
 * @param {string} string - String.
 * @param {number} length - Length to trim to.
 * @param {string} [trail='...'] - Trailing characters.
 * @returns {string} Truncated string.
 */
export function truncate(string, length, trail = '...') {
    if (string.length > length) {
        return string.substr(0, length).trim() + trail;
    }
    
    return string;
}

/**
 * Assigns values of object as keys.
 * @param {Object} obj - Object.
 * @returns {Object} Object with values mapped as keys.
 *
 * @example
 * valuesAsKeys({ a: 'apple' }); // { a: 'apple', 'apple': 'a' }
 */
export function valuesAsKeys(obj) {
    // create clone so we do not modify original object
    let result = Object.assign({}, obj);
    
    for (let k in result) {
        result[result[k]] = k;
    }
    
    return result;
}

/**
 * Escapes a cell value in CSV.
 * @param {string} str - String.
 * @returns {string} Escaped string.
 */
export function escapeCSV(str) {
    // quotes are replaced with double quotes to escape them
    // https://www.freeformatter.com/csv-escape.html
    return `"${str.toString().replace(/"/g, '""')}"`;
}

/**
 * Escape a string in RegExp.
 * @param {string} str - String.
 * @returns {string} Escaped string.
 */
export function escapeRegExp(str) {
    return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * Escapes text to use as strings in HTML format.
 * @param {string} text - Text to escape.
 * @returns {string} Escaped text.
 */
export function escapeHTML(text) {
    let pattern = /[\"&<>]/g;
    
    // Testing string before replace is slightly faster
    // if you do not expect the strings to contain much HTML
    if (pattern.test(text)) {
        return text.replace(pattern, (value) => {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[value];
        });
    }
    
    return text;
}

/**
 * Gets a URL parameter.
 * @param {string} name - Name of parameter.
 * @returns {(string|null)} The value of parameter, if found.
 */
export function getUrlParam(name) {
    return new URL(location.href).searchParams.get(name);
}

/**
 * Converts HTML to nodes.
 * @param {string} html - Valid HTML string.
 * @returns {Document} HTML document object.
 */
export function getDocument(html) {
    // Native DOMParser is not available in manifest V3 service workers.
    // // return the body
    // return new DOMParser().parseFromString(html, 'text/html');
    // @ts-ignore
    return parseFromString(html);
}
