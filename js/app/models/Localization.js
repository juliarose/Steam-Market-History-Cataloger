import { fetchJSON } from '../helpers/fetchjson.js'; 
import { ELangCode } from '../enums/ELangCode.js'; 
import { isNumber, valuesAsKeys } from '../helpers/utils.js';
import { getExtensionURL } from '../browser.js';
import { AppError } from '../error.js';

/**
 * JSON data for a localization.
 * @typedef {Object} LocaleData
 * @property {MonthsLocaleData} months - Month strings.
 * @property {UILocaleData} ui - User interface strings.
 * @property {DBLocaleData} db - Database strings.
 */

/**
 * Month strings.
 * @typedef {Object} MonthsLocaleData
 * @property {string[]} months.abbreviations - Array of month abbreviations. These are in order from January to December.
 */

/**
 * Identifiers for each column in the database.
 * @typedef {Object.<string, Object.<string, (number|string)>>} Identifiers
 */
 
/**
 * User interface strings.
 * @typedef {Object} UILocaleData
 * @property {Object} tables - Table strings.
 * @property {string} tables.empty - Message for empty tables.
 * @property {string} tables.next - Label for next button.
 * @property {string} tables.previous - Label for previous button.
 * @property {string} tables.download - Label for download button.
 * 
 * @property {Object} values - User interface values.
 * @property {Object.<string, string>} values.is_credit - Mapping for credit values.
 * @property {Object.<string, string>} values.name_color - Mapping for name colors.
 * 
 * @property {Object} names - User interface names.
 * @property {string} names.appname - Name of the app.
 * @property {string} names.date - Date label.
 * @property {string} names.month - Month label.
 * @property {string} names.type - Type label.
 * @property {string} names.sale - Total sales label.
 * @property {string} names.sale_count - Sales count label.
 * @property {string} names.purchase - Total purchase label.
 * @property {string} names.purchase_count - Purchase count label.
 * @property {string} names.name_color - Name color label.
 * @property {string} names.background_color - Background color label.
 * @property {string} names.name - Name label.
 * @property {string} names.market_name - Market name label.
 * @property {string} names.market_hash_name - Market hash name label.
 * @property {string} names.year - Year label.
 * @property {string} names.appid - App ID label.
 * @property {string} names.is_credit - Credit type label.
 * @property {string} names.index - Index label.
 * @property {string} names.after_date - After date label.
 * @property {string} names.before_date - Before date label.
 * @property {string} names.last_week - Last week label.
 * @property {string} names.last_month - Last month label.
 * @property {string} names.before - Before label.
 * @property {string} names.after - After label.
 * @property {string} names.start - Start label.
 * @property {string} names.end - End label.
 * 
 * @property {Object} titles
 * @property {string} titles.update - Update title.
 * @property {string} titles.load - Load title.
 * @property {string} titles.annual - Annual title.
 * @property {string} titles.app - App title.
 * @property {string} titles.last_n_days - Last N days title.
 * @property {string} titles.showing_last_n_days - Showing last N days title.
 * @property {string} titles.steam_market - Steam Market title.
 * @property {string} titles.start_loading - Start loading title.
 * @property {string} titles.view_all - View all title.
 * @property {string} titles.view_recent - View recent title.
 * @property {string} titles.view_totals - View totals title.
 * @property {string} titles.update_listings - Update listings title.
 * @property {string} titles.purchase_history - Purchase history title.
 * @property {string} titles.preferences - Preferences title.
 * @property {string} titles.monthly - Monthly title.
 */
 
/**
 * @typedef {Object} DBLocaleData
 * @property {Object} listings
 * @property {Object} listings.names
 * @property {string} listings.names.transaction_id - Transaction ID.
 * @property {string} listings.names.appid - App ID.
 * @property {string} listings.names.contextid - Context ID.
 * @property {string} listings.names.assetid - Asset ID.
 * @property {string} listings.names.classid - Class ID.
 * @property {string} listings.names.instanceid - Instance ID.
 * @property {string} listings.names.price - Price.
 * @property {string} listings.names.is_credit - Credit flag.
 * @property {string} listings.names.date_listed - Date listed.
 * @property {string} listings.names.date_acted - Date acted.
 * @property {string} listings.names.name_color - Name color.
 * @property {string} listings.names.background_color - Background color.
 * @property {string} listings.names.name - Name.
 * @property {string} listings.names.market_name - Market name.
 * @property {string} listings.names.market_hash_name - Market hash name.
 * @property {string} listings.names.index - Index.
 * 
 * @property {Object} listings.column_names
 * @property {string} listings.column_names.transaction_id - Transaction ID column name.
 * @property {string} listings.column_names.appid - App ID column name.
 * @property {string} listings.column_names.contextid - Context ID column name.
 * @property {string} listings.column_names.assetid - Asset ID column name.
 * @property {string} listings.column_names.classid - Class ID column name.
 * @property {string} listings.column_names.instanceid - Instance ID column name.
 * @property {string} listings.column_names.price - Price column name.
 * @property {string} listings.column_names.is_credit - Credit column name.
 * @property {string} listings.column_names.date_listed - Date listed column name.
 * @property {string} listings.column_names.date_acted - Date acted column name.
 * @property {string} listings.column_names.name_color - Name color column name.
 * @property {string} listings.column_names.background_color - Background color column name.
 * @property {string} listings.column_names.name - Name column name.
 * @property {string} listings.column_names.market_name - Market name column name.
 * @property {string} listings.column_names.market_hash_name - Market hash name column name.
 * @property {string} listings.column_names.index - Index column name.
 * 
 * @property {Object} accounttransactions
 * @property {Object} accounttransactions.names
 * @property {string} accounttransactions.names.transaction_id - Transaction ID.
 * @property {string} accounttransactions.names.transaction_type - Transaction type.
 * @property {string} accounttransactions.names.price - Total amount.
 * @property {string} accounttransactions.names.is_credit - Credit flag.
 * @property {string} accounttransactions.names.count - Count.
 * @property {string} accounttransactions.names.date - Date.
 * 
 * @property {Object} accounttransactions.column_names
 * @property {string} accounttransactions.column_names.transaction_id - Transaction ID column name.
 * @property {string} accounttransactions.column_names.transaction_type - Transaction type column name.
 * @property {string} accounttransactions.column_names.price - Total amount column name.
 * @property {string} accounttransactions.column_names.is_credit - Credit column name.
 * @property {string} accounttransactions.column_names.count - Count column name.
 * @property {string} accounttransactions.column_names.date - Date column name.
 * 
 * @property {Identifiers} accounttransactions.identifiers
 * @property {Object.<string, (number|string)>} accounttransactions.identifiers.transaction_type - Transaction type identifiers.
 * 
 * @property {Object} gameitems
 * @property {Object} gameitems.names
 * @property {string} gameitems.names.app - App.
 * @property {string} gameitems.names.name - Name.
 * @property {string} gameitems.names.price - Price.
 * @property {string} gameitems.names.count - Count.
 */

/**
 * Loads and stores language data.
 */
export class Localization {
    /**
     * Language code from Steam e.g. "en" for English.
     * @type {string}
     */
    code;
    /**
     * Name of language e.g. "english" for English.
     * @type {string}
     */
    language;
    /**
     * User interface strings.
     * @type {UILocaleData}
     */
    ui;
    /**
     * Database strings.
     * @type {DBLocaleData}
     */
    db;
    /**
     * Month abbreviations.
     * @type {string[][]}
     * @private
     */
    #monthAbbreviations = [];
    /**
     * Month regex patterns.
     * @type {RegExp[]}
     * @private
     */
    #monthPatterns = [];
    
    /**
     * Creates a new localization.
     * @param {Object} options - Language attributes.
     * @param {string} [options.code] - Language code from Steam e.g. "en" for English.
     * @param {string} [options.language] - Name of language e.g. "english" for English.
     * @param {LocaleData} json - JSON object containing string values.
     */
    constructor({ code, language }, json) {
        this.code = code;
        this.language = language;
        this.ui = json.ui;
        this.db = json.db;
        
        json.months.abbreviations.forEach((abbreviations) => {
            this.#monthPatterns.push(new RegExp(abbreviations, 'i'));
            this.#monthAbbreviations.push(abbreviations.split('|')[0]);
        });
        
        // this will transform the identifiers so that we can obtain an item's key using its value
        // this is only used for the accounttransactions table
        // e.g.
        // { "Purchase": 1 }
        // becomes
        // { "Purchase": 1, 1: "Purchase" }
        this.db.accounttransactions.identifiers.transaction_type = valuesAsKeys(
            this.db.accounttransactions.identifiers.transaction_type
        );
    }
    
    /**
     * Gets a localization of a given language.
     * @param {string} language - Name of language from Steam.
     * @returns {Promise<Localization>} Resolves with locales when done.
     */
    static async get(language) {
        const code = ELangCode[language];
        const uri = getExtensionURL(`/json/locales/${code}/strings.json`);
        
        if (!code) {
            throw new AppError(`No locales available for ${language}`);
        }
        
        // get the json for the localizations
        // and return a localization object
        return new Localization({ code, language }, await fetchJSON(uri));
    }
    
    // Unused
    /**
     * Converts a date back into a date string.
     * @param {Date} date - String of date.
     * @returns {string} Date string.
     */
    toDateString(date) {
        const month = date.getMonth();
        const day = date.getDate();
        const monthAbbreviation = this.#monthAbbreviations[month];
        const code = this.code;
        
        switch (code) {
            case 'ja':
            case 'zh-TW': 
            case 'zh-CN': {
                return `${month}月${day}日`;
                // break is not needed after return
            }
            default: {
                return [
                    monthAbbreviation,
                    day
                ].join(' ');
            }
        }
    }
    
    /**
     * Parses a date string.
     * @throws {Error} When date failed to parse.
     * @param {string} string - String of date.
     * @returns {Object} Object containing month and day from string.
     */
    parseDateString(string) {
        function toNumber(string) {
            return parseInt(string);
        }
        
        const code = this.code;
        const months = this.#monthPatterns;
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
                break;
            }
            // japanese, format is '1月27日' (month, day)
            //
            // simplified chinese, format is '1月27日' (month, day)
            // the same as japanese
            //
            // traditional chinese, format is '1 月 27 日' (month, day)
            // also the same as japanese, but includes spaces
            case 'ja':
            case 'zh-CN':
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
                
                break;
            }
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
                
                break;
            }
            default: {
                for (let i = 0; i < months.length; i++) {
                    const pattern = months[i];
                    
                    if (pattern.test(string)) {
                        month = i;
                        break;
                    }
                }
                
                day = parseInt(string.replace(/\D/g, ''));
            }
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
    }
}
