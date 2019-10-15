'use strict';

import {fetchJSON} from '../helpers/fetchjson.js'; 
import {ELangCode} from '../enums/ELangCode.js'; 
import {isNumber} from '../helpers/utils.js';
import {getExtensionURL} from '../browser.js';

/**
 * Loads/stores language data.
 * 
 * @namespace Localization
 * @class
 */
function Localization() {
    
}

/**
 * Get language strings.
 * @memberOf Localization
 * @param {String} language - Name of language from Steam.
 * @param {locales.get-callback} callback - Called when finished loading.
 * @returns {Promise.<Object>} Resolve with locales when done, reject on error.
 */
Localization.prototype.get = function(language) {
    const code = ELangCode[language];
    const uri = getExtensionURL(`/json/locales/${code}/strings.json`);
    
    this.language = language;
    this.code = code;
    
    if (!code) {
        return Promise.reject('No locales available for ' + language);
    } else {
        return fetchJSON(uri)
            .then((json) => {
                this.set(json);
                
                return json;
            });
    }
};

/**
 * Set strings.
 * @memberOf Localization
 * @param {Object} strings - JSON object containing strings.
 * @returns {undefined}
 */
Localization.prototype.set = function(strings) {
    Object.assign(this, strings);
    
    this.months.abbreviations_patterns = [];
    this.months.abbreviations.forEach((abbreviations, i) => {
        const pattern = new RegExp(abbreviations, 'i');
        
        this.months.abbreviations_patterns[i] = pattern;
        this.months.abbreviations[i] = abbreviations.split('|')[0];
    });
};

/**
 * Converts a date back into a date string.
 * @memberOf Localization
 * @param {Date} date - String of date.
 * @returns {String} Date string.
 */
Localization.prototype.toDateString = function(date) {
    // currently not in use but may be used later
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
        } break;
    }
};

/**
 * Parse a date string.
 * @memberOf Localization
 * @throws {Error} When date failed to parsed.
 * @param {String} string - String of date.
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
            const split = string.replace(/\.$/).split('.').map(toNumber);
            
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
            const match = string.replace(/\s/g, '').match(/(\d+)月(\d+)日/);
            
            if (match) {
                [month, day] = match.slice(1).map(toNumber);
                
                // since the month is zero-based
                month -= 1;
            }
        } break;
        // korean, format is '2019년 1월 27일' (year, month, day)
        // yes, it is even generous enough to provide the year!
        case 'ko': {
            const match = string.match(/(\d+)년 (\d+)월 (\d+)일/);
            
            if (match) {
                [year, month, day] = match.slice(1).map(toNumber);
                
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
    
    if (isValid) {
        // we successfully parsed a month and day from the given string
        // year is optional
        return {
            year,
            month,
            day
        };
    } else {
        // date failed to parse
        throw new Error('Invalid date: ' + string);
    }
};

export {Localization};