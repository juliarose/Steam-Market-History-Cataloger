// @ts-check

import { escapeRegExp } from './helpers/utils.js';

/**
 * @typedef {import('./currency.js').Currency} Currency
 */

/**
 * Formats thousands places with seperators.
 * @param {number} value - Value.
 * @param {string} thousand - Thousand seperator.
 * @returns {string} Formatted value.
 */
function thousands(value, thousand) {
    return value
        .toString()
        .replace(/[0-9](?=(?:[0-9]{3})+(?![0-9]))/gi, (match) => {
            return match + thousand;
        });
}

/**
 * Formats a value based on currency.
 * @param {number} value - Integer value of money (for USD this would be the number of cents).
 * @param {Currency} currency - Details of currency.
 * @returns {string} Formatted number.
 */
function formatMoneyInteger(value, currency) {
    const precision = currency.precision;
    const power = Math.pow(10, precision);
    const whole = Math.floor(value / power);
    const division = Math.round(value % power);
    const formatted = thousands(whole, currency.thousand);
    // use format_precision when available
    let format_precision = currency.format_precision;
    
    if (format_precision === undefined) {
        // default to precision
        format_precision = precision;
    }
    
    if (format_precision === 0) {
        // no decimals
        return formatted;
    } else if (division === 0 && currency.trim_trailing) {
        // if there are no divisions, and trailing zeros should be trimmed,
        // do not include them
        return formatted;
    }
    
    return [
        formatted,
        toFixedInteger(division, format_precision)
    ].join(currency.decimal);
}

/**
 * Returns integer value from money string.
 * @param {string} value - Money string.
 * @param {Currency} currency - Details of currency.
 * @returns {string} String representing integer value of money in its smallest division e.g. Cents in USD.
 *
 * @example
 * extractNumber('$34.33', USD); // '3433'
 * 
 * @example
 * extractNumber('34', RUB); // '3400'
 */
function extractNumber(value, currency) {
    const stripped = value
        // take out the symbol
        .replace(currency.symbol, '')
        // remove thousand places
        .replace(new RegExp(`${escapeRegExp(currency.thousand)}`, 'g'), '')
        // replace decimal places to actual decimals
        .replace(currency.decimal, '.')
        // remove all non-digits and non-decimals
        .replace(/[^\d\.]/g, '');
    
    return toFixedNoRounding(stripped, currency.precision).replace(/\D/g,'');
}

/**
 * Fixes an integer to a certain length.
 * @param {(string | number)} value - Value.
 * @param {number} precision - Length of number.
 * @returns {string} Fixed string.
 */
function toFixedInteger(value, precision) {
    value = value.toString();
    
    if (precision <= 0) {
        // no decimal places, just return the value
        return value;
    } else if (value.length > precision) {
        // trim decimal places to precision
        return value.substr(0, precision);
    }
    
    //  add some zeros to the front
    while (value.length < precision) {
        value = '0' + value;
    }
    
    return value;
}

/**
 * Fixes a number to a certain precision.
 * @param {(string | number)} value - Value.
 * @param {number} precision - Number of decimal places.
 * @returns {string} Fixed string.
 */
function toFixedNoRounding(value, precision) {
    const split = value.toString().split('.');
    const wholeValue = split[0];
    const decimalValue = split[1] || '';
    
    if (precision <= 0) {
        // no decimal places, just return the whole value
        return wholeValue;
    }
    
    return `${wholeValue}.${toFixedInteger(decimalValue, precision)}`;
}

/**
 * Parses price from currency string.
 * @param {string} value - Currency string, e.g. "$1.34".
 * @param {Currency} currency - Details of currency.
 * @returns {number} Integer value of parsed amount.
 */
export function parseMoney(value, currency) {
    // get number with full decimal places
    // remove all non-numeric values from string
    // then we can extract an integer from the string
    return parseInt(extractNumber(value, currency));
}

/**
 * Formats money value.
 * @param {number} value - Value.
 * @param {Currency} currency - Details of currency.
 * @returns {string} Formatted value.
 */
export function formatMoney(value, currency) {
    const formatted = formatMoneyInteger(value, currency);
    const symbol = currency.symbol;
    const spacer = currency.spacer ? ' ' : '';
    let arr = [symbol, formatted];
    
    // reverse if symbol appears after the number
    if (currency.after) {
        arr.reverse();
    }
    
    return arr.join(spacer);
}

/**
 * Formats a number based on currency locale.
 * @param {number} value - Value.
 * @param {Currency} currency - Details of currency.
 * @returns {string} Formatted value.
 */
export function formatLocaleNumber(value, currency) {
    const formatted = thousands(Math.floor(value), currency.thousand);
    // get all decimal place values
    // convert to string and get group past decimal place
    const remainder = value.toString().split('.')[1];
    
    if (remainder) {
        return [
            formatted,
            remainder
        ].join(currency.decimal || '.');
    }
    
    return formatted;
}

/**
 * Formats value to decimals based on currency precision.
 * @param {number} value - Value.
 * @param {number} precision - Number of decimal places.
 * @returns {number} Divided number.
 */
export function toDecimal(value, precision) {
    // 10 the power of how many places we want
    // e.g. 100 for 2 places (550 / 100 = 5.50)
    const power = Math.pow(10, precision);
    
    return value / power;
}
