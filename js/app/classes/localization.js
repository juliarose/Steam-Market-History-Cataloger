'use strict';

import { fetchJSON } from '../helpers/fetchjson.js'; 
import { ELangCode } from '../enums/ELangCode.js'; 
import { isNumber, valuesAsKeys } from '../helpers/utils.js';
import { getExtensionURL } from '../browser.js';

/**
 * Loads/stores language data.
 * 
 * @namespace Localization
 * @param {Object} options - Language attributes.
 * @param {string} [options.code] - Language code from Steam e.g. "en" for English.
 * @param {string} [options.language] - Name of language e.g. "english" for English.
 * @param {Object} json - JSON object containing string values.
 * @class
 */
function Localization({ code, language }, json) {
    Object.assign(this, json);
    
    this.code = code;
    this.language = language;
    this.months.abbreviations_patterns = [];
    this.months.abbreviations.forEach((abbreviations, i) => {
        const pattern = new RegExp(abbreviations, 'i');
        
        this.months.abbreviations_patterns[i] = pattern;
        this.months.abbreviations[i] = abbreviations.split('|')[0];
    });
    
    // this will configure the identifiers in each table
    for (let table in this.db) {
        if (!this.db[table].identifiers) {
            continue;
        }
        
        for (let identifierName in this.db[table].identifiers) {
            const identifiers = this.db[table].identifiers[identifierName];
            
            // this will transform the identifiers so that we can obtain an item's key using its value
            // e.g.
            // { "Purchase": 1 }
            // becomes
            // { "Purchase": 1, 1: "Purchase" }
            this.db[table].identifiers[identifierName] = valuesAsKeys(identifiers);
        }
    }
}

/**
 * Gets a localization of a given language.
 * @memberOf Localization
 * @param {string} language - Name of language from Steam.
 * @returns {Promise.<Localization>} Resolve with locales when done.
 */
Localization.get = async function(language) {
    const code = ELangCode[language];
    const uri = getExtensionURL(`/json/locales/${code}/strings.json`);
    
    if (!code) {
        return Promise.reject(`No locales available for ${language}`);
    }
    
    // get the json for the localizations
    // and return a localization object
    return new Localization({ code, language }, await fetchJSON(uri));
};

// currently not in use but may be used later
/**
 * Converts a date back into a date string.
 * @memberOf Localization
 * @param {Date} date - String of date.
 * @returns {string} Date string.
 */
Localization.prototype.toDateString = function(date) {
    const month = date.getMonth();
    const day = date.getDate();
    const monthAbbreviation = this.months.abbreviations[month];
    const code = this.code;
    
    switch (code) {
        case 'ja':
        case 'zh-TW': 
        case 'zh-CN': {
            return `${month}月${day}日`;
        } break;
        default: {
            return [
                monthAbbreviation,
                day
            ].join(' ');
        }
    }
};

/**
 * Parses a date string.
 * @memberOf Localization
 * @throws {Error} When date failed to parse.
 * @param {string} string - String of date.
 * @returns {Object} Object containing month and day from string.
 */
Localization.prototype.parseDateString = function(string) {
    function toNumber(string) {
        return parseInt(string);
    }
    
    const code = this.code;
    const months = this.months.abbreviations_patterns;
    let year, month, day;
    
    switch (code) {
        // finnish, format is '31.4.' (day, month)
        case 'fi': {
            const split = string
                .replace(/\.$/)
                .split('.')
                .map(toNumber);
            
            [day, month] = split;
            
            month -= 1;
        } break;
        // japanese, format is '1月27日' (month, day)
        case 'ja':
        // simplified chinese, format is '1月27日' (month, day)
        // the same as japanese
        case 'zh-CN':
        // traditional chinese, format is '1 月 27 日' (month, day)
        // also the same as japanese, but includes spaces
        case 'zh-TW': {
            const match = string
                .replace(/\s/g, '')
                .match(/(\d+)月(\d+)日/);
            
            if (match) {
                [month, day] = match
                    // this will start the match at the first matched group
                    .slice(1)
                    // then map each group to a number
                    .map(toNumber);
                
                // since the month is zero-based
                month -= 1;
            }
        } break;
        // korean, format is '2019년 1월 27일' (year, month, day)
        // yes, it is even generous enough to provide the year!
        case 'ko': {
            const match = string.match(/(\d+)년 (\d+)월 (\d+)일/);
            
            if (match) {
                [year, month, day] = match
                    // this will start the match at the first matched group
                    .slice(1)
                    // then map each group to a number
                    .map(toNumber);
                
                // since the month is zero-based
                month -= 1;
            }
        } break;
        default: {
            for (let i = 0; i < months.length; i++) {
                const pattern = months[i];
                
                if (pattern.test(string)) {
                    month = i;
                    break;
                }
            }
            
            day = parseInt(string.replace(/\D/g, ''));
        } break;
    }
    
    const isValid = Boolean(
        isNumber(month) &&
        isNumber(day)
    );
    
    if (!isValid) {
        // date failed to parse
        throw new Error('Invalid date: ' + string);
    }
    
    // we successfully parsed a month and day from the given string
    // year is optional
    return {
        year,
        month,
        day
    };
};

export { Localization };