'use strict';

/**
 * Parses price from currency string.
 * @param {String} value - Currency string, e.g. "$1.34".
 * @param {Currency} currency - Details of currency.
 * @returns {Number} Integer value of parsed amount.
 */
function parseMoney(value, currency) {
    // get number with full decimal places
    // remove all non-numeric values from string
    // then we can extract an integer from the string
    return parseInt(extractNumber(value, currency));
}

/**
 * Formats money value.
 * @param {Number} value - Value.
 * @param {Currency} currency - Details of currency.
 * @returns {String} Formatted value.
 */
function formatMoney(value, currency) {
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
 * @param {Number} value - Value.
 * @param {Currency} currency - Details of currency.
 * @returns {String} Formatted value.
 */
function formatLocaleNumber(value, currency) {
    const formatted = thousands(Math.floor(value), currency.thousand);
    // get all decimal place values
    // convert to string and get group past decimal place
    const remainder = value.toString().split('.')[1];
    
    if (remainder) {
        return [
            formatted,
            remainder
        ].join(currency.decimal || '.');
    } else {
        return formatted;
    }
}

/**
 * Formats value to decimals based on currency precision.
 * @param {Number} value - Value.
 * @param {Number} precision - Number of decimal places.
 * @returns {Number} Divided number.
 */
function toDecimal(value, precision) {
    const power = Math.pow(10, precision);
    
    return value / power;
}

/**
 * Formats thousands places with seperators.
 * @param {Number} value - Value.
 * @param {String} thousand - Thousand seperator.
 * @returns {String} Formatted value.
 */
function thousands(value, thousand) {
    return value.toString().replace(/[0-9](?=(?:[0-9]{3})+(?![0-9]))/gi, (match) => {
        return match + thousand;
    });
}

/**
 * Formats a value based on currency.
 * @param {Number} value - Integer value of money (for USD this would be the number of cents).
 * @param {Currency} currency - Details of currency.
 * @returns {String} Formatted number.
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
    } else {
        return [
            formatted,
            toFixedInteger(division, format_precision)
        ].join(currency.decimal);
    }
}

/**
 * Returns integer value from money string.
 * @param {String} value - Money string.
 * @param {Currency} currency - Details of currency.
 * @returns {String} String representing integer value of money in its smallest division e.g. Cents in USD.
 *
 * @example
 * extractNumber('$34.33', USD); // '3433'
 * 
 * @example
 * extractNumber('34', RUB); // '3400'
 */
function extractNumber(value, currency) {
    const stripped = value
        // remove thousand places
        .replace(currency.thousand, '')
        // replace decimal places to actual decimals
        .replace(currency.decimal, '.')
        // remove all non-digits and non-decimals
        .replace(/[^\d\.]/g, '');
    
    return toFixedNoRounding(stripped, currency.precision).replace(/\D/g,'');
}

/**
 * Fixes an integer to a certain length.
 * @param {(String|Number)} value - Value.
 * @param {Number} precision - Length of number.
 * @returns {String} Fixed string.
 */
function toFixedInteger(value, precision) {
    value = value.toString();
    
    if (precision <= 0) {
        // no decimal places, just return the value
        return value;
    } else if (value.length > precision) {
        // trim decimal places to precision
        return value.substr(0, precision);
    } else {
        //  add some zeros
        while (value.length < precision) {
            value = '0' + value;
        }
        
        return value;
    }
}

/**
 * Fixes a number to a certain precision.
 * @param {(String|Number)} value - Value.
 * @param {Number} precision - Number of decimal places.
 * @returns {String} Fixed string.
 */
function toFixedNoRounding(value, precision) {
    const split = value.toString().split('.');
    const wholeValue = split[0];
    const decimalValue = split[1] || '';
    
    if (precision <= 0) {
        // no decimal places, just return the whole value
        return wholeValue;
    } else {
        return `${wholeValue}.${toFixedInteger(decimalValue, precision)}`;
    }
}

export {
    parseMoney,
    formatMoney,
    formatLocaleNumber,
    toDecimal
};