import { Localization } from '../js/app/classes/localization.js';
import { valuesAsKeys } from '../js/app/helpers/utils.js';
import { ELangCode } from '../js/app/enums/ELangCode.js';

const path = require('path');
const fs = require('fs');

function loadLocales() {
    const getLocales = async (code) => {
        const languages = valuesAsKeys(ELangCode);
        const language = languages[code];
        
        return Localization.get(language);
    };
    const parentPath = path.join(__dirname, '..');
    const jsonPath = path.join(parentPath, 'json', 'locales');
    const codes = fs.readdirSync(jsonPath);
    const promises = codes.map(getLocales);
    
    return Promise.all(promises);
}

function findLanguage(language) {
    return languages.find((locales) => {
        return locales.language === language;
    });
}

let english;
let languages = [];

beforeAll(async () => {
    languages = await loadLocales();
    english = findLanguage('english');
    
    return;
});

it('Gets a localization', async () => {
    expect.assertions(1);
    
    const language = 'english';
    const locales = await Localization.get(language);
    
    return expect(locales.db).toBeDefined();
});

it('Fails to get a localization that does not exist', async () => {
    expect.assertions(1);
    
    try {
        await Localization.get('meows');
    } catch (error) {
        expect(error).toBeDefined();
    }
});

it('Converts date to string properly', () => {
    const date = new Date(2019, 8, 20);
    const converted = english.toDateString(date);
    
    expect(converted).toBe('Sep 20');
});

it('Parses date string properly in English', () => {
    const language = findLanguage('english');
    const dateString = 'Oct 2';
    const {
        month,
        day
    } = language.parseDateString(dateString);
    
    expect(month).toBe(9);
    expect(day).toBe(2);
});

it('Parses date string properly in Japanese', () => {
    const language = findLanguage('japanese');
    const dateString = '10月2日';
    const {
        month,
        day
    } = language.parseDateString(dateString);
    
    expect(month).toBe(9);
    expect(day).toBe(2);
});

it('Parses date string properly in Finnish', () => {
    const language = findLanguage('finnish');
    const dateString = '2.10.';
    const {
        month,
        day
    } = language.parseDateString(dateString);
    
    expect(month).toBe(9);
    expect(day).toBe(2);
});

it('Parses date string properly in German', () => {
    const language = findLanguage('german');
    const dateString = '2. Okt.';
    const {
        month,
        day
    } = language.parseDateString(dateString);
    
    expect(month).toBe(9);
    expect(day).toBe(2);
});

it('Parses date string properly in Russian', () => {
    const language = findLanguage('russian');
    const dateString = '2 окт';
    const {
        month,
        day
    } = language.parseDateString(dateString);
    
    expect(month).toBe(9);
    expect(day).toBe(2);
});