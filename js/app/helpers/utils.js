'use strict';

// Utilities used throughout app

/**
 * Delays a promise.
 * @param {number} [time=1000] - Time in ms to delay.
 * @param {*} [value] - Value to pass to resolve.
 * @returns {Promise} Promise that resolves after the given delay.
 */
export async function delayPromise(time, value) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(value);
        }, time);
    });
}

/**
 * Pauses for an amount of time.
 * @param {number} time - Time in ms to delay.
 * @returns {Promise} Resolve when done.
 */
export async function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

/**
 * Prints a date as a string.
 * @param {Date} date - Date to print.
 * @param {string} [separator='/'] - Separator used between dates.
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
 * Prints a date for a CSV file.
 * @param {Date} date - Date to print.
 * @returns {string} String of date to be inserted into a CSV cell.
 */
export function printCSVDate(date) {
    return [
        date.getMonth() + 1,
        date.getDate(),
        date.getFullYear()
    ].join('/');
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
 * Gets unique values from array.
 * @param {Array} arr - Array of basic items (strings, numbers).
 * @returns {Array} Array with unique values.
 */
export function uniq(arr) {
    return [...new Set(arr)];
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
 * @param {Array} arr - Array.
 * @param {Function} method - Function to satisfy.
 * @returns {Array} Partitioned array.
 */
export function partition(arr, method) {
    // create an array with two empty arrays to be filled
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
 * @param {Array} arr - Array.
 * @param {(string|Function)} key - Key to take value from.
 * @returns {Object} Object of groups.
 */
export function groupBy(arr, key) {
    // if 'key' is a function, set method to 'key'
    let method = typeof key === 'function' ? key : null;
    
    return arr.reduce((group, item) => {
        let value = method ? method(item) : item[key];
        
        (group[value] = group[value] || []).push(item);
        
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
 * Create range of numbers from low to high.
 * @param {number} low - Low number.
 * @param {number} high - High number.
 * @returns {Array} Array of numbers in range.
 */
export function range(low, high) {
    return Array(high - low).fill(low).map((a, i) => a + i);
}

/**
 * Create a random string.
 * @param {number} [length=10] - Length of string.
 * @returns {string} Random string.
 */
export function randomString(length) {
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
     * @returns {(string|Array)} Query parameter.
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
 * Recursively transforms key/values in object, including array values.
 *
 * Also can act as a basic deep clone method.
 * @param {Object} obj - Object to transform.
 * @param {Object} [transforms={}] - Object containing transformation functions.
 * @param {Function} [transform.keys] - Function for transforming keys from 'obj'.
 * @param {Function} [transform.values] - Function for transforming values from 'obj'.
 * @param {number} [level=0] - Level of recursion, passed as the 2nd argument to a transform function.
 * @returns {Object} Transformed object.
 *
 * @example
 * transformObj({
 *     apple: 'Green',
 *     orange: 'Orange',
 *     cherry: {
 *         color: 'Red'
 *     }
 * }, {
 *     keys: (key, level) => {
 *         return level === 0 ? `fruit_${key}` : key;
 *     },
 *     values: (value) => {
 *         return value.toUpperCase();
 *     }
 * }); // { fruit_apple: 'GREEN', fruit_orange: 'ORANGE', fruit_cherry: { color: 'RED' } }
 */
export function transformObj(obj, transforms = {}, level = 0) {
    if (typeof obj !== 'object' || obj === null) {
        // nothing we can do
        return obj;
    }
    
    function convertValue(value) {
        if (Array.isArray(value)) {
            return value.map(convertValue);
        } else if (typeof value === 'object') {
            return transformObj(value, transforms, level + 1);
        } else if (transforms.values) {
            // transform value
            return transforms.values(value, level);
        } else {
            return value;
        }
    }
    
    return Object.keys(obj).reduce((result, key) => {
        let value = obj[key];
        
        if (transforms.keys) {
            // transform key
            key = transforms.keys(key, level);
        }
        
        result[key] = convertValue(value);
        
        return result;
    }, {});
}

/**
 * Recursively clones an object's values.
 *
 * This will only clone objects containing basic values (e.g. Strings, numbers).
 * @param {Object} obj - Object.
 * @returns {Object} Cloned object.
 */
export function deepClone(obj) {
    return transformObj(obj);
}

/**
 * Creates an object from an array of keys.
 * @param {Array} keys - Array of keys.
 * @param {*} [value] - Value to assign to each key.
 * @returns {Object} Object with keys mapped from array.
 *
 * @example
 * arrToKeys(['a', 'b'], 0); // { a: 0, b: 0 }
 */
export function arrToKeys(keys, value) {
    let result = {};
    
    for (let i = 0; i < keys.length; i++) {
        result[keys[i]] = value;
    }
    
    return result;
}

/**
 * Checks if a value is a number or not.
 * @param {*} value - Value to test.
 * @returns {boolean} Whether the value is a number or not.
 */
export function isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value) && !isNaN(value - 0);
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
    } else {
        return string;
    }
}

/**
 * Chooses a form based on number.
 * @param {string} singular - Singular form.
 * @param {string} plural - Plural form.
 * @param {number} value - Test value.
 * @returns {string} Form based on value.
 */
export function basicPlural(singular, plural, value) {
    if (value !== 1) {
        return plural;
    } else {
        return singular;
    }
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
    } else {
        return text;
    }
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
 * @returns {Object} HTML document object.
 */
export function getDocument(html) {
    // return the body
    return new DOMParser().parseFromString(html, 'text/html').querySelector('body');
}