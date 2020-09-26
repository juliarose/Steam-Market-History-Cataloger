'use strict';

import { getDocument } from '../helpers/utils.js';
import { parseMoney } from '../money.js';
import { Listing } from '../classes/listing.js';

/**
 * Makes a date.
 * @param {number} year - Year of date.
 * @param {number} month - Month of date.
 * @param {number} day - Day of date.
 * @returns {Date} Date.
 */
function makeDate(year, month, day) {
    // all dates are set at 12pm in UTC time on the date of occurrence
    return new Date(Date.UTC(year, month, day, 12));
}

/**
 * Results of parsing.
 * @typedef {Object} ParseListingResult
 * @property {(error|null)} error - Error, if any.
 * @property {(Boolean|null)} fatal - Whether the error is fatal.
 * @property {Listing[]} records - Array of parsed listings.
 * @property {Object} modifiedDate - Modified object from store passed to function.
 */

/**
 * Parses listings from response.
 * @param {Object} response - Response from Steam.
 * @param {Object} store - Stored state object.
 * @param {Currency} currency - Currency object for parsing price strings.
 * @param {Localization} localization - Locales.
 * @throws {Error} When dates were unable to be parsed or data is missing from some listings.
 * @returns {ParseListingResult} Results of parsing.
 */
export function parseListings(response, store, currency, localization) {
    const doc = getDocument(response.results_html);
    const messageEl = doc.querySelector('.market_listing_table_message');
    const messageLinkEl = messageEl && messageEl.querySelector('a');
    const listingsList = doc.getElementsByClassName('market_listing_row');
    const { start, total_count, assets } = response;
    let hasBrokenAssets = false;
    
    // very rarely the assets object will have data where the name details are missing
    // if this is the case, we want to ignore the response
    if (typeof assets === 'object') {
        // this is a bit of a loop but it is probably the quickest way of going through the data
        for (let appid in assets) {
            for (let contextid in assets[appid]) {
                for (let assetid in assets[appid][contextid]) {
                    const asset = assets[appid][contextid][assetid];
                    
                    // asset is missing market_hash_name
                    if (asset.market_hash_name == null || asset.market_hash_name === '') {
                        // we have broken assets
                        hasBrokenAssets = true;
                        break;
                    }
                }
            }
        }
    }
    
    const hasError = Boolean(
        messageEl ||
        total_count === null ||
        total_count === 0 ||
        hasBrokenAssets ||
        // does not have assets
        response.assets == null
    );
    // all values used from "store", create clone so we do not modify original object
    let modifiedDate = Object.assign({}, store.date);
    
    if (hasError) {
        const messageText = messageEl && messageEl.textContent.trim();
        const fatal = Boolean(
            messageLinkEl ||
            // no listings
            // an unsuccesful response will have this value as "null"
            total_count === 0
        );
        let error = messageText || 'No listings';
        
        if (!messageText && hasBrokenAssets) {
            error = 'Missing data';
        }
        
        // we have an error
        return {
            fatal,
            error,
            records: []
        };
    }
    
    /**
     * Gets array of objects from elements.
     * @param {Array} listingsArr - Array of DOM elements for each listing.
     * @returns {Listing[]} Array of listings.
     */
    function listingsToJSON(listingsArr) {
        const lastTxID = store.last && store.last.transaction_id;
        const lastIndexedTxID = store.last_indexed && store.last_indexed.transaction_id;
        const lastFetchedTxID = store.last_fetched && store.last_fetched.transaction_id;
        // array of jquery objects
        let listings = [];
        
        // get listings after last obtained listing
        for (let i = 0; i < listingsArr.length; i++) {
            const listingEl = listingsArr[i];
            const gainOrLossEl = listingEl.querySelector('.market_listing_gainorloss');
            // listings that were refunded will include a span with a style "text-decoration: line-through"
            const refundedPriceEl = listingEl.querySelector('.market_listing_price span');
            const isCompletedTransaction = Boolean(
                // has + or - text
                gainOrLossEl.textContent.trim().length > 0 &&
                // was not refunded
                !refundedPriceEl
            );
            
            if (isCompletedTransaction) {
                const transaction_id = getTransactionId(listingEl);
                const index = calcListingIndex(i);
                // shares the same index as the last indexed transaction
                // this is the begininng of the previous load loop
                const isFirstIndexedListing = Boolean(
                    lastIndexedTxID === transaction_id
                );
                // when transactions occur during loads they will push previosly collected items
                // to the next page, this checks if we've reached one of those items
                const isLastIndexedListing = Boolean(
                    lastTxID === transaction_id ||
                    lastFetchedTxID === transaction_id
                );
                
                if (isFirstIndexedListing) {
                    // first indexed listing found, stop
                    break;
                } else if (isLastIndexedListing) {
                    // reset
                    listings = [];
                } else {
                    // push object
                    listings.push({
                        index,
                        listingEl
                    });
                }
            }
        }
        
        return listings.map(listingToJSON);
    }
    
    /**
     * Parses a listing row.
     * @param {Object} details - Listing row element.
     * @param {number} details.index - Index of listing.
     * @param {Object} details.listingEl - Listing row element.
     * @returns {Object} Listing data for row.
     */
    function listingToJSON({ index, listingEl }) {
        // get our elements
        const gainOrLossEl = listingEl.querySelector('.market_listing_gainorloss');
        const priceEl = listingEl.querySelector('.market_listing_price');
        const listedDateList = listingEl.querySelectorAll('.market_listing_listed_date');
        const whoActedEl = listingEl.querySelector('.market_listing_whoactedwith');
        const whoActedLinkEl = whoActedEl.querySelector('a');
        // collect the data
        const transactionId = getTransactionId(listingEl);
        const gainText = gainOrLossEl.textContent.trim();
        const id = listingEl.id;
        // is this a sale or purchase?
        const isCredit = gainText === '-';
        const priceText = (priceEl.textContent || '').trim();
        // parse the price text
        const price = parseMoney(priceText, currency);
        // get the hover asset for this listing
        const {
            appid,
            contextid,
            assetid
        } = getHover(id);
        const data = {
            appid,
            contextid,
            assetid,
            transaction_id: transactionId,
            index: index,
            price: price,
            price_raw: priceText,
            is_credit: isCredit ? 1 : 0,
            date_acted_raw: listedDateList[0].textContent.trim(),
            date_listed_raw: listedDateList[1].textContent.trim(),
            seller: whoActedLinkEl.getAttribute('href')
        };
        const assetData = getAssetKeys(data, [
            'classid',
            'instanceid',
            'name',
            'market_name',
            'market_hash_name',
            'name_color',
            'background_color',
            'icon_url'
        ]);
        const dateData = getDate(data) || {};
        
        // name color should always be uppercase for uniformity
        if (assetData.name_color) {
            assetData.name_color = assetData.name_color.toUpperCase();
        }
        
        if (assetData.background_color) {
            assetData.background_color = assetData.background_color.toUpperCase();
        }
        
        // now wrap it all together
        return new Listing(Object.assign(data, assetData, dateData));
    }
    
    // calculates the index for a listing
    function calcListingIndex(index) {
        return total_count - (start + index);  
    }
    
    // gets the transaction id from an element
    function getTransactionId(listingEl) {
        return listingEl.id.replace('history_row_', '').replace('_', '-');
    }
    
    /**
     * Gets parameters from hover.
     * @param {string} id - ID of listing.
     * @returns {Array} RegExp results.
     */
    function getHover(id) {
        const pattern = new RegExp(`CreateItemHoverFromContainer\\(\\s*g_rgAssets\\s*,\\s*\\\'${id}_image\\\'\\s*,\\s*(\\d+)\\s*,\\s*\\\'(\\d+)\\\'\\s*,\\s*\\\'(\\d+)\\\'\\s*,\\s*(\\d+)\\s*\\);`);
        const match = response.hovers.match(pattern);
        const [ , appid, contextid, assetid] = match;
        
        return {
            appid,
            contextid,
            assetid
        };
    }
    
    /**
     * Gets dates of listing, this is a complicated process since dates are displayed in short string formats.
     * E.g. "Mar 30", which must be manually parsed and year must be determined based on numerous conditions.
     * @param {Object} data - Object containing date strings.
     * @returns {Object} Parsed dates.
     */
    function getDate(data) {
        /**
         * Parses dates from date strings.
         * @param {Object} data - Object containing date strings; "date_listed_raw" and "date_acted_raw".
         * @returns {Object} Object containing parsed month and day from strings for each date; "date_listed" and "date_acted".
         */
        function getParsedDate(data) {
            const names = [
                'date_listed',
                'date_acted'
            ];
            
            return names.reduce((result, name) => {
                // get the raw date string
                const dateStr = data[name + '_raw'];
                const date = (
                    dateStr &&
                    localization.parseDateString(dateStr)
                );
                
                if (date) {
                    result[name] = date;
                }
                
                return result;
            }, {});
        }
        
        /**
         * Gets date from parsed date.
         * @param {Object} parsedDate - Object containing month and day of date.
         * @returns {Date} Date object with estimated year.
         */
        function getDateActed(parsedDate) {
            const lastDate = makeDate(
                parsedDate.year || modifiedDate.year,
                modifiedDate.month,
                modifiedDate.day || parsedDate.day
            );
            // stored day may not be available...
            let date = makeDate(
                parsedDate.year || modifiedDate.year,
                parsedDate.month,
                parsedDate.day
            );
            
            if (parsedDate.year) {
                // a year was obtained from the parser
                modifiedDate.year = parsedDate.year;
            } else if (date > lastDate || date > tomorrow) {
                // date is ahead of last date, or ahead of current date
                // so subtract a year
                modifiedDate.year = modifiedDate.year - 1;
                // then remake date
                date = makeDate(modifiedDate.year, parsedDate.month, parsedDate.day);
            }
            
            return date;
        }
        
        /**
         * Gets date from parsed date.
         * @param {Object} parsedDate - Object containing month and day of date.
         * @param {Date} acted - Date acted.
         * @returns {Date} Date object with estimated year.
         */
        function getDateListed(parsedDate, acted) {
            let date = makeDate(
                parsedDate.year || modifiedDate.year,
                parsedDate.month,
                parsedDate.day
            );
            
            if (date > acted) {
                // date listed should not be ahead of date acted, so subtract a year
                date = makeDate(modifiedDate.year - 1, parsedDate.month, parsedDate.day);
            }
            
            return date;
        }
        
        const now = new Date();
        // tomorrow's date to account for time zone differences
        const tomorrow = makeDate(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1
        );
        const parsed = getParsedDate(data);
        const failedParsing = Boolean(
            !parsed.date_listed ||
            !parsed.date_acted
        );
        
        // parsing failed
        // the parsing function would normally throw an error, but in case it doesn't...
        // must have date_listed and date_acted
        if (failedParsing) {
            throw new Error('Date parsing failed');
        }
        
        const dateActed = getDateActed(parsed.date_acted);
        const dateListed = getDateListed(parsed.date_listed, dateActed);
        
        // set stored dates
        modifiedDate.month = parsed.date_acted.month;
        modifiedDate.day = parsed.date_acted.day;
        
        return {
            date_acted: dateActed,
            date_listed: dateListed
        };
    }
    
    // returns the asset for an item from response.assets
    function getAsset({ appid, contextid, assetid }) {
        return response.assets[appid][contextid][assetid];
    }
    
    /**
     * Extracts data from item asset.
     * @param {Object} data - Asset data.
     * @param {Array} keys - Keys to collect.
     * @returns {Object} Object with keys mapped from asset using list from "keys".
     */
    function getAssetKeys(data, keys) {
        let obj = {};
        const asset = getAsset(data);
        
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const val = asset[k];
            
            // not null or undefined
            if (val != undefined) {
                obj[k] = val;
            }
        }
        
        return obj;
    }
    
    const listings = listingsToJSON(Array.from(listingsList));
    const missingData = listings.some((listing) => {
        // listing must have these values defined
        return [
            'appid',
            'contextid',
            'instanceid',
            'transaction_id',
            'market_hash_name',
            'index',
            'price',
            'is_credit',
            'date_listed',
            'date_acted'
        ].some((key) => {
            // null or undefined
            return listing[key] == undefined;
        });
    });
    
    if (missingData) {
        // fatal
        // we do not want to store bad data
        throw new Error('Invalid listing data');
    } else {
        return {
            records: listings,
            dateStore: modifiedDate
        };
    }
}