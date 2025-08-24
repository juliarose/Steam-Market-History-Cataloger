// @ts-check

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
export const Currency = Object.freeze({
    // US Dollars
    // Minor unit: Cent (1/100)
    1: {
        wallet_code: 1,
        code: 'USD',
        symbol: '$',
        precision: 2,
        thousand: ',',
        decimal: '.'
    },
    // British Pound Sterling
    // Minor unit: Penny (1/100)
    2: {
        wallet_code: 2,
        code: 'GBP',
        symbol: '£',
        precision: 2,
        thousand: ',',
        decimal: '.'
    },
    // Euro
    // Minor unit: Cent (1/100)
    3: {
        wallet_code: 3,
        code: 'EUR',
        symbol: '€',
        precision: 2,
        thousand: ' ',
        decimal: ',',
        after: true
    },
    // Swiss Franc
    // Minor unit: Rappen (1/100)
    4: {
        wallet_code: 4,
        code: 'CHF',
        symbol: 'CHF',
        precision: 2,
        thousand: '\'',
        decimal: '.'
    },
    // Russian Ruble
    // Minor unit: Kopek (1/100)
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
    // Polish Złoty
    // Minor unit: Grosz (1/100)
    6: {
        wallet_code: 6,
        code: 'PLN',
        symbol: 'zł',
        precision: 2,
        thousand: ' ',
        decimal: ',',
        spacer: true,
        after: true
    },
    // Brazilian Real
    // Minor unit: Centavo (1/100)
    7: {
        wallet_code: 7,
        code: 'BRL',
        symbol: 'R$',
        precision: 2,
        thousand: '.',
        decimal: ',',
        spacer: true
    },
    // Japanese Yen
    // Minor unit: Sen (1/100)
    8: {
        wallet_code: 8,
        code: 'JPY',
        symbol: '¥',
        precision: 2,
        format_precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true
    },
    // Norwegian Krone
    // Minor unit: Øre (1/100)
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
    // Indonesian Rupiah
    // Minor unit: Sen (1/100)
    10: {
        wallet_code: 10,
        code: 'IDR',
        symbol: 'Rp',
        // minor unit is 1/100 = Sen
        precision: 2,
        // however these are not displayed
        format_precision: 0,
        thousand: ' ',
        decimal: '.',
        spacer: true
    },
    // Malaysian Ringgit
    // Minor unit: Sen (1/100)
    11: {
        wallet_code: 11,
        code: 'MYR',
        symbol: 'RM',
        precision: 2,
        thousand: ',',
        decimal: '.'
    },
    // Philippine Peso
    // Minor unit: Centavo (1/100)
    12: {
        wallet_code: 12,
        code: 'PHP',
        symbol: 'P',
        precision: 2,
        thousand: ',',
        decimal: '.'
    },
    // Singapore Dollar
    // Minor unit: Cent (1/100)
    13: {
        wallet_code: 13,
        code: 'SGD',
        symbol: 'S$',
        precision: 2,
        thousand: ',',
        decimal: '.'
    },
    // Thai Baht
    // Minor unit: Satang (1/100)
    14: {
        wallet_code: 14,
        code: 'THB',
        symbol: '฿',
        precision: 2,
        thousand: ',',
        decimal: '.'
    },
    // Vietnamese Dong
    // Minor unit: Hào (1/10), Xu (1/100)
    15: {
        wallet_code: 15,
        code: 'VND',
        symbol: '₫',
        precision: 2,
        thousand: ',',
        decimal: '.'
    },
    // South Korean Won
    // Minor unit: Jeon (1/100)
    16: {
        wallet_code: 16,
        code: 'KRW',
        symbol: '₩',
        precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true
    },
    // Turkish Lira
    // Minor unit: Kuruş (1/100)
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
    // Ukrainian Hryvnia
    // Minor unit: Kopiyka (1/100)
    18: {
        wallet_code: 18,
        code: 'UAH',
        symbol: '₴',
        precision: 2,
        thousand: '',
        decimal: ',',
        after: true
    },
    // Mexican Peso
    // Minor unit: Centavo (1/100)
    19: {
        wallet_code: 19,
        code: 'MXN',
        symbol: 'Mex$',
        precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true
    },
    // Canadian Dollar
    // Minor unit: Cent (1/100)
    20: {
        wallet_code: 20,
        code: 'CAD',
        symbol: 'CDN$',
        precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true
    },
    // Australian Dollar
    // Minor unit: Cent (1/100)
    21: {
        wallet_code: 21,
        code: 'AUD',
        symbol: 'A$',
        precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true
    },
    // New Zealand Dollar
    // Minor unit: Cent (1/100)
    22: {
        wallet_code: 22,
        code: 'NZD',
        symbol: 'NZ$',
        precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true
    },
    // Chinese Yuan Renminbi
    // Minor unit: Jiao (1/10), Fen (1/100)
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
    // Indian Rupee
    // Minor unit: Paisa (1/100)
    24: {
        wallet_code: 24,
        code: 'INR',
        symbol: '₹',
        // minor unit is 1/100 = Paisa
        // Steam displays these as 0 decimal places
        precision: 2,
        // we display these using 0 decimal places
        // https://github.com/juliarose/Steam-Market-History-Cataloger/issues/39
        format_precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true
    },
    // Chilean Peso
    // Minor unit: Centavo (1/100)
    25: {
        wallet_code: 25,
        code: 'CLP',
        symbol: 'CLP$',
        // minor unit is 1/100 = Centavo
        // Steam displays these as 0 decimal places
        precision: 2,
        // we display these using 0 decimal places
        format_precision: 0,
        thousand: '.',
        decimal: ',',
        spacer: true,
        trim_trailing: true
    },
    // Peruvian Sol
    // Minor unit: Céntimo (1/100)
    26: {
        wallet_code: 26,
        code: 'PEN',
        symbol: 'S/.',
        precision: 2,
        thousand: ',',
        decimal: '.'
    },
    // Colombian Peso
    // Minor unit: Centavo (1/100)
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
    // South African Rand
    // Minor unit: Cent (1/100)
    28: {
        wallet_code: 28,
        code: 'ZAR',
        symbol: 'R ',
        precision: 2,
        thousand: ' ',
        decimal: '.'
    },
    // Hong Kong Dollar
    // Minor unit: Cent (1/100)
    29: {
        wallet_code: 29,
        code: 'HKD',
        symbol: 'HK$',
        precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true
    },
    // New Taiwan Dollar
    // Minor unit: Jiao (1/10)
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
    // Saudi Riyal
    // Minor unit: Halala (1/100)
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
    // United Arab Emirates Dirham
    // Minor unit: Fils (1/100)
    32: {
        wallet_code: 32,
        code: 'DH',
        symbol: 'DH',
        precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true,
        after: true
    },
    // Argentine Peso
    // Minor unit: Centavo (1/100)
    34: {
        wallet_code: 34,
        code: 'ARS',
        symbol: '$',
        precision: 2,
        thousand: '.',
        decimal: ',',
        spacer: true
    },
    // Israeli New Shekel
    // Minor unit: Agora (1/100)
    35: {
        wallet_code: 35,
        code: 'ILS',
        symbol: '₪',
        precision: 2,
        thousand: ',',
        decimal: '.',
        spacer: true
    },
    // Kazakhstani Tenge
    // Minor unit: Tiyn (1/100)
    37: {
        wallet_code: 37,
        code: 'KZT',
        symbol: '₸',
        precision: 2,
        thousand: ' ',
        decimal: ',',
        after: true
    },
    // Kuwaiti Dinar
    // Minor unit: Fils (1/1000)
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
    // Qatari Riyal
    // Minor unit: Dirham (1/100)
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
    // Costa Rican Colón
    // Minor unit: Céntimo (1/100)
    40: {
        wallet_code: 40,
        code: 'CRC',
        symbol: '₡',
        precision: 2,
        thousand: '.',
        decimal: ','
    },
    // Uruguayan Peso
    // Minor unit: Centésimo (1/100)
    41: {
        wallet_code: 41,
        code: 'UYU',
        symbol: '$U',
        precision: 2,
        thousand: '.',
        decimal: ','
    },
    // Bulgarian Lev
    // Minor unit: Stotinka (1/100)
    42: {
        wallet_code: 42,
        code: 'BGN',
        symbol: 'лв',
        precision: 2,
        thousand: ' ',
        decimal: '.',
        after: true
    },
    // Croatian Kuna
    // Minor unit: Lipa (1/100)
    43: {
        wallet_code: 43,
        code: 'HRK',
        symbol: 'kn',
        precision: 2,
        thousand: '.',
        decimal: ',',
        after: true
    },
    // Czech Koruna
    // Minor unit: Haléř (1/100)
    44: {
        wallet_code: 44,
        code: 'CZK',
        symbol: 'Kč',
        precision: 2,
        thousand: ' ',
        decimal: ',',
        after: true
    },
    // Danish Krone
    // Minor unit: Øre (1/100)
    45: {
        wallet_code: 45,
        code: 'DKK',
        symbol: 'kr',
        precision: 2,
        thousand: '.',
        decimal: ',',
        after: true
    },
    // Hungarian Forint
    // Minor unit: Fillér (1/100)
    46: {
        wallet_code: 46,
        code: 'HUF',
        symbol: 'Ft',
        precision: 2,
        thousand: ' ',
        decimal: ',',
        after: true
    },
    // Romanian Leu
    // Minor unit: Ban (1/100)
    47: {
        wallet_code: 47,
        code: 'RON',
        symbol: 'lei',
        precision: 2,
        thousand: '.',
        decimal: ',',
        after: true
    }
});
