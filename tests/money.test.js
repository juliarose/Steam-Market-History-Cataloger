import {getCurrency} from '../js/app/currency.js';
import {
    parseMoney,
    formatMoney,
    formatLocaleNumber,
    toDecimal
} from '../js/app/money.js';

const CurrencyCode = {
    USD: 1,
    EUR: 3
};

it('Gets a currency', () => {
    const currency = getCurrency(CurrencyCode.USD);
    
    expect(currency).toBeDefined();
});

it('Converts money integer to decimal', () => {
    const currency = getCurrency(CurrencyCode.USD);
    const value = 100;
    const converted = toDecimal(value, currency.precision);
    
    expect(converted).toBe(1.00);
});

it('Formats money value', () => {
    const currency = getCurrency(CurrencyCode.USD);
    const value = 100000;
    const formatted = formatMoney(value, currency);
    
    expect(formatted).toBe('$1,000.00');
});

it('Formats money value in Euros', () => {
    const currency = getCurrency(CurrencyCode.EUR);
    const value = 100000;
    const formatted = formatMoney(value, currency);
    
    expect(formatted).toBe('1 000,00€');
});

it('Formats money value with currency symbol after number', () => {
    const currency = Object.assign({}, getCurrency(CurrencyCode.USD), {
        after: true
    });
    const value = 100;
    const formatted = formatMoney(value, currency);
    
    expect(formatted).toBe('1.00$');
});

it('Formats money value with spacer', () => {
    const currency = Object.assign({}, getCurrency(CurrencyCode.USD), {
        spacer: true
    });
    const value = 100;
    const formatted = formatMoney(value, currency);
    
    expect(formatted).toBe('$ 1.00');
});

it('Formats money value with trailing zeros trimmed', () => {
    const currency = Object.assign({}, getCurrency(CurrencyCode.USD), {
        trim_trailing: true
    });
    const value = 100;
    const formatted = formatMoney(value, currency);
    
    expect(formatted).toBe('$1');
});

it('Formats locale number', () => {
    const currency = getCurrency(CurrencyCode.USD);
    const value = 100;
    const formatted = formatLocaleNumber(value, currency);
    
    expect(formatted).toBe('100');
});

it('Parses money value', () => {
    const currency = getCurrency(CurrencyCode.USD);
    const value = '$1.00';
    const parsed = parseMoney(value, currency);
    
    expect(parsed).toBe(100);
});
