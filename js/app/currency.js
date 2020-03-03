'use strict';

/*
 * This file contains details of how every currency should be parsed and formatted
 *
 * Sources:
 * https://www.xe.com/currency/
 * https://www.thefinancials.com/Default.aspx?SubSectionID=curformat
 */

/**
 * Currency.
 * @typedef {Object} Currency
 * @property {number} wallet_code - The ID of the currency from Steam.
 * @property {string} code - ISO 4217 currency code e.g. "USD".
 * @property {string} symbol - Currency symbol e.g. "$".
 * @property {number} precision - Decimal place precision.
 * @property {string} thousand - Thousand place character.
 * @property {string} decimal - Decimal place character.
 * @property {boolean} [spacer] - Whether the amount should be displayed with a space between the number and symbol.
 * @property {boolean} [after] - Whether the symbol should be displayed after the number.
 * @property {boolean} [trim_trailing] - Whether trailing zeroes should be trimmed on whole values.
 * @property {number} [format_precision] - Decimal place precision used in formatting.
 */
const Currency = Object.freeze({
    1: {
        wallet_code: 1,
        code: 'USD',
        symbol: '$',
        precision: 2,
        thousand: ',',
        decimal: '.'
    },
    2: {
        wallet_code: 2,
        code: 'GBP',
        symbol: '£',
        precision: 2,
        thousand: ',',
        decimal: '.'
    },
    3: {
        wallet_code: 3,
        code: 'EUR',
        symbol: '€',
        precision: 2,
        thousand: ' ',
        decimal: ',',
        after: true
    },
    5: {
        wallet_code: 5,
        code: 'RUB',
        symbol: 'pуб.',
        precision: 2,
        thousand: ' ',
        decimal: ',',
        spacer: true,
        trim_trailing: true,
        after: true
    },
    6: {
        wallet_code: 6,
        code: 'PLN',
        symbol: 'zl',
        precision: 2,
        thousand: ' ',
        decimal: ',',
        spacer: true,
        after: true
    },
    7: {
        wallet_code: 7,
        code: 'BRL',
        symbol: 'R$',
        precision: 2,
        thousand: '.',
        decimal: ',',
        spacer: true
    },
    8: {
        wallet_code: 8,
        code: 'JPY',
        symbol: '¥',
        // minor unit is 1/100 = Sen
        precision: 2,
        // yens are commonly display without decimal places
        // we display these using 0 decimal places
        format_precision: 0,
        thousand: ',',
        decimal: '.',
        spacer: true
    },
    9: {
        wallet_code: 9,
        code: 'NOK',
        symbol: 'kr',
        precision: 2,
        thousand: '.',
        decimal: ',',
        spacer: true,
        after: true
    },
    10: {
        wallet_code: 10,
        code: 'IDR',
        symbol: 'Rp',
        // minor unit is 1/100 = Sen (obsolete)
        // but Steam displays these as 2 decimal places
        precision: 2,
        // we display these using 0 decimal places
        format_precision: 0,
        thousand: ' ',
        decimal: '.',
        spacer: true
    },
    11: {
        wallet_code: 11,
        code: 'MYR',
        symbol: 'RM',
        precision: 2,
        thousand: ',',
        decimal: '.'
    },
    12: {
        wallet_code: 12,
        code: 'PHP',
        symbol: 'P',
        precision: 2,
        thousand: ',',
        decimal: '.'
    },
    13: {
        wallet_code: 13,
        code: 'SGD',
        symbol: 'S$',
        precision: 2,
        thousand: ',',
        decimal: '.'
    },
    14: {
        wallet_code: 14,
        code: 'THB',
        symbol: '฿',
        precision: 2,
        thousand: ',',
        decimal: '.'
    },
    15: {
        wallet_code: 15,
        code: 'VND',
        symbol: '₫',
        precision: 2,
        thousand: ',',
        decimal: '.'
    },
    16: {
        wallet_code: 16,
        code: 'KRW',
        symbol: '₩',
        precision: 2,
        thousand: ',',
        decimal: '.'
    },
    17: {
        wallet_code: 17,
        code: 'TRY',
        symbol: 'TL',
        precision: 2,
        thousand: '',
        decimal: ',',
        spacer: true,
        after: true
    },
    18: {
        wallet_code: 18,
        code: 'UAH',
        symbol: '₴',
        precision: 2,
        thousand: '',
        decimal: ',',
        after: true
    },
    19: {
        wallet_code: 19,
        code: 'MXN',
        symbol: 'Mex$',
        precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true
    },
    20: {
        wallet_code: 20,
        code: 'CAD',
        symbol: 'CDN$',
        precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true
    },
    21: {
        wallet_code: 21,
        code: 'AUD',
        symbol: 'A$',
        precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true
    },
    22: {
        wallet_code: 22,
        code: 'NZD',
        symbol: 'NZ$',
        precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true
    },
    23: {
        wallet_code: 23,
        code: 'CNY',
        symbol: '¥',
        // minor unit is 1/10 = Jiao
        // but Steam displays these as 2 decimal places
        // these are also commonly formatted using 2 decimal places
        precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true
    },
    24: {
        wallet_code: 24,
        code: 'INR',
        symbol: '₹',
        precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true
    },
    25: {
        wallet_code: 25,
        code: 'CLP',
        symbol: 'CLP$',
        precision: 2,
        thousand: '.',
        decimal: ',',
        spacer: true,
        trim_trailing: true
    },
    26: {
        wallet_code: 26,
        code: 'PEN',
        symbol: 'S/.',
        precision: 2,
        thousand: ',',
        decimal: '.'
    },
    27: {
        wallet_code: 27,
        code: 'COP',
        symbol: 'COL$',
        precision: 2,
        thousand: '.',
        decimal: ',',
        spacer: true,
        trim_trailing: true
    },
    28: {
        wallet_code: 28,
        code: 'ZAR',
        symbol: 'R ',
        precision: 2,
        thousand: ' ',
        decimal: '.'
    },
    29: {
        wallet_code: 29,
        code: 'HKD',
        symbol: 'HK$',
        precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true
    },
    30: {
        wallet_code: 30,
        code: 'TWD',
        symbol: 'NT$',
        // minor unit is 1/10 = Jiao
        // but Steam displays these as 2 decimal places
        precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true
    },
    31: {
        wallet_code: 31,
        code: 'SAR',
        symbol: 'SR',
        precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true,
        after: true
    },
    32: {
        wallet_code: 32,
        code: 'AED',
        symbol: 'DH',
        precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true,
        after: true
    },
    34: {
        wallet_code: 34,
        code: 'ARS',
        symbol: '$',
        precision: 2,
        thousand: '.',
        decimal: ',',
        spacer: true
    },
    35: {
        wallet_code: 35,
        code: 'ILS',
        symbol: '₪',
        precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true
    },
    37: {
        wallet_code: 37,
        code: 'KZT',
        symbol: '₸',
        precision: 2,
        thousand: ' ',
        decimal: ',',
        spacer: true,
        after: true
    },
    38: {
        wallet_code: 38,
        code: 'KWD',
        symbol: 'ك',
        precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true,
        after: true
    },
    39: {
        wallet_code: 39,
        code: 'QAR',
        symbol: '﷼',
        precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true,
        after: true
    },
    40: {
        wallet_code: 40,
        code: 'CRC',
        symbol: '₡',
        precision: 2,
        thousand: '.',
        decimal: ','
    },
    41: {
        wallet_code: 41,
        code: 'UYU',
        symbol: '$U',
        precision: 2,
        thousand: '.',
        decimal: ','
    }
});

/**
 * Gets a currency.
 * @param {(number|string)} id - ID of currency.
 * @returns {(Currency|undefined)} Currency details.
 */
function getCurrency(id) {
    return Currency[id];
}

export { Currency, getCurrency };