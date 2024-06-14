import { getCurrency } from '../js/app/currency.js';
import { ECurrencyCode } from '../js/app/enums/ECurrencyCode.js';
import {
    parseMoney,
    formatMoney,
    formatLocaleNumber,
    toDecimal
} from '../js/app/money.js';

it('Gets a currency', () => {
    const currency = getCurrency(ECurrencyCode.USD);
    
    expect(currency).toBeDefined();
});

it('Converts money integer to decimal', () => {
    const currency = getCurrency(ECurrencyCode.USD);
    const value = 100;
    const converted = toDecimal(value, currency.precision);
    
    expect(converted).toBe(1.00);
});

it('Formats money value', () => {
    const currency = getCurrency(ECurrencyCode.USD);
    const value = 100000;
    const formatted = formatMoney(value, currency);
    
    expect(formatted).toBe('$1,000.00');
});

it('Formats money value in Euros', () => {
    const currency = getCurrency(ECurrencyCode.EUR);
    const value = 100000;
    const formatted = formatMoney(value, currency);
    
    expect(formatted).toBe('1 000,00€');
});

it('Parses money value in Euros', () => {
    const currency = getCurrency(ECurrencyCode.EUR);
    const value = '99,--€';
    const parsed = parseMoney(value, currency);
    
    expect(parsed).toBe(9900);
});

it('Parses money value in Russian rubles', () => {
    const currency = getCurrency(ECurrencyCode.RUB);
    const value = '483,34 pуб.';
    const parsed = parseMoney(value, currency);
    
    expect(parsed).toBe(48334);
});

it('Parses money value in Ukrainian hryvnia', () => {
    const currency = getCurrency(ECurrencyCode.UAH);
    const value = '244₴';
    const parsed = parseMoney(value, currency);
    
    expect(parsed).toBe(24400);
});

it('Parses money value in Canadian dollars', () => {
    const currency = getCurrency(ECurrencyCode.CAD);
    const value = 'CDN$ 6.99';
    const parsed = parseMoney(value, currency);
    
    expect(parsed).toBe(699);
});

it('Parses money value in Peruvian sol', () => {
    const currency = getCurrency(ECurrencyCode.PEN);
    const value = 'S/.23.00';
    const parsed = parseMoney(value, currency);
    
    expect(parsed).toBe(2300);
});

it('Parses money value in Brazilian real', () => {
    const currency = getCurrency(ECurrencyCode.BRL);
    const value = 'R$ 37,00';
    const parsed = parseMoney(value, currency);
    
    expect(parsed).toBe(3700);
});

it('Parses money value in Indian rupees', () => {
    const currency = getCurrency(ECurrencyCode.INR);
    const value = '₹ 690';
    const parsed = parseMoney(value, currency);
    
    expect(parsed).toBe(69000);
});

it('Parses money value in Japanese yen', () => {
    const currency = getCurrency(ECurrencyCode.JPY);
    const value = '¥ 3,657';
    const parsed = parseMoney(value, currency);
    
    expect(parsed).toBe(365700);
});

it('Parses money value in Chilean pesos', () => {
    const currency = getCurrency(ECurrencyCode.CLP);
    const value = 'CLP$ 34.500';
    const parsed = parseMoney(value, currency);
    
    expect(parsed).toBe(3450000);
});

it('Parses money value in Kazakhstani tenges', () => {
    const currency = getCurrency(ECurrencyCode.KZT);
    const value = '4 399,99₸';
    const parsed = parseMoney(value, currency);
    
    expect(parsed).toBe(439999);
});

it('Parses money value in Polish złoty', () => {
    const currency = getCurrency(ECurrencyCode.KZT);
    const value = '29,00zł';
    const parsed = parseMoney(value, currency);
    
    expect(parsed).toBe(2900);
});

it('Formats money value with currency symbol after number', () => {
    const currency = Object.assign({}, getCurrency(ECurrencyCode.USD), {
        after: true
    });
    const value = 100;
    const formatted = formatMoney(value, currency);
    
    expect(formatted).toBe('1.00$');
});

it('Formats money value with spacer', () => {
    const currency = Object.assign({}, getCurrency(ECurrencyCode.USD), {
        spacer: true
    });
    const value = 100;
    const formatted = formatMoney(value, currency);
    
    expect(formatted).toBe('$ 1.00');
});

it('Formats money value with trailing zeros trimmed', () => {
    const currency = Object.assign({}, getCurrency(ECurrencyCode.USD), {
        trim_trailing: true
    });
    const value = 100;
    const formatted = formatMoney(value, currency);
    
    expect(formatted).toBe('$1');
});

it('Formats locale number', () => {
    const currency = getCurrency(ECurrencyCode.USD);
    const value = 100;
    const formatted = formatLocaleNumber(value, currency);
    
    expect(formatted).toBe('100');
});

it('Parses money value', () => {
    const currency = getCurrency(ECurrencyCode.USD);
    const value = '$1.00';
    const parsed = parseMoney(value, currency);
    
    expect(parsed).toBe(100);
});

