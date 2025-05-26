// @ts-check

import { getDocument } from '../helpers/utils.js';
import { parseMoney } from '../money.js';
import { Listing } from '../models/Listing.js';

/**
 * @typedef {import('../currency.js').Currency} Currency
 * @typedef {import('../models/Localization.js').Localization} Localization
 * @typedef {import('../steam/requests/get.js').MyHistoryResponse} MyHistoryResponse
 * @typedef {import('../steam/requests/get.js').Asset} Asset
 * @typedef {import('../manager/ListingManager.js').LoadState} LoadState
 * @typedef {import('../manager/ListingManager.js').LoadStateDate} LoadStateDate
 */

/**
 * Makes a date.
 * @param {number} year - Year of date.
 * @param {number} month - Month of date.
 * @param {number} day - Day (date) of date.
 * @returns {Date} Date.
 */
function makeDate(year, month, day) {
    // all dates are set at 12pm in UTC time on the date of occurrence
    return new Date(Date.UTC(year, month, day, 12));
}

/**
 * Results of parsing.
 * @typedef {Object} ParseListingResult
 * @property {string} [error] - Error, if any.
 * @property {boolean} [fatal] - Whether the error is fatal.
 * @property {Listing[]} records - Array of parsed listings.
 * @property {LoadStateDate} [dateStore] - Modified object from state passed to function.
 */

/**
 * Parses listings from response.
 * @param {MyHistoryResponse} response - Response from Steam.
 * @param {LoadState} state - Stored state object.
 * @param {Currency} currency - Currency object for parsing price strings.
 * @param {Localization} localization - Locales.
 * @throws {Error} When dates were unable to be parsed or data is missing from some listings.
 * @returns {ParseListingResult} Results of parsing.
 */
export function parseListings(response, state, currency, localization) {
    if (!response.results_html) {
        return {
            fatal: false,
            error: 'Response missing results_html',
            records: []
        };
    }
    
    const doc = getDocument(response.results_html);
    const messageEl = doc.getElementsByClassName('.market_listing_table_message')[0];
    const messageLinkEl = messageEl && messageEl.getElementsByTagName('a')[0];
    const listingsList = doc.getElementsByClassName('market_listing_row');
    const { start, total_count, assets } = response;
    let hasBrokenAssets = false;
    
    if (typeof assets === 'object') {
        // very rarely the assets object will have data where the name details are missing
        // if this is the case, we want to ignore the response
        for (let appid in assets) {
            for (let contextid in assets[appid]) {
                for (let assetid in assets[appid][contextid]) {
                    const asset = assets[appid][contextid][assetid];
                    
                    // asset is missing market_hash_name
                    if (asset.market_hash_name == null || asset.market_hash_name === '') {
                        // item is not tradable,
                        if (asset.tradable == 0) {
                            continue;
                        }
                        
                        // we have broken assets
                        hasBrokenAssets = true;
                        break;
                    }
                }
            }
        }
    }
    
    /**
     * All values used from "state", cloned so we do not modify original object.
     * 
     * The properties are modified as dates from listings are processed.
     * @type {LoadStateDate}
     */
    const modifiedDate = {
        year: state.date.year,
        month: state.date.month,
        day: state.date.day
    };
    const hasError = Boolean(
        messageEl ||
        total_count === null ||
        total_count === 0 ||
        hasBrokenAssets ||
        // does not have assets
        response.assets == null
    );
    
    if (hasError) {
        const messageText = (
            messageEl &&
            messageEl.textContent &&
            messageEl.textContent.trim()
        );
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
     * @param {Element[]} listingsArr - Array of DOM elements for each listing.
     * @returns {Listing[]} Array of listings.
     */
    function listingsToJSON(listingsArr) {
        const lastTxID = state.last && state.last.transaction_id;
        const lastIndexedTxID = state.last_indexed && state.last_indexed.transaction_id;
        const lastFetchedTxID = state.last_fetched && state.last_fetched.transaction_id;
        // array of jquery objects
        let listings = [];
        
        // get listings after last obtained listing
        for (let i = 0; i < listingsArr.length; i++) {
            const listingEl = listingsArr[i];
            const gainOrLossEl = listingEl.getElementsByClassName('market_listing_gainorloss')[0];
            // listings that were refunded will include a span with a style "text-decoration: line-through"
            const refundedPriceEl = listingEl.getElementsByClassName('market_listing_price span')[0];
            const gainOrLossText = gainOrLossEl.textContent;
            const isCompletedTransaction = Boolean(
                gainOrLossText &&
                // has + or - text
                gainOrLossText.trim().length > 0 &&
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
     * @param {Element} details.listingEl - Listing row element.
     * @returns {Listing} Listing data for row.
     */
    function listingToJSON({ index, listingEl }) {
        // get our elements
        const gainOrLossEl = listingEl.getElementsByClassName('market_listing_gainorloss')[0];
        const priceEl = listingEl.getElementsByClassName('market_listing_price')[0];
        const listedDateList = listingEl.getElementsByClassName('market_listing_listed_date');
        // collect the data
        const transactionId = getTransactionId(listingEl);
        const id = listingEl.getAttribute('id');
        
        if (!id) {
            // id is missing
            throw new Error('Listing element does not contain ID attribute');
        }
        
        const gainOrLossText = gainOrLossEl.textContent;
        
        if (!gainOrLossText) {
            // gain or loss text is missing
            throw new Error('Gain or loss text is missing');
        }
        
        // is this a sale or purchase?
        const isCredit = gainOrLossText.trim() === '-';
        const priceText = priceEl.textContent;
        
        if (!priceText) {
            // price text is missing
            throw new Error('Price text is missing');   
        }
        
        // parse the price text
        const price = parseMoney(priceText.trim(), currency);
        // get the hover asset for this listing
        const {
            appid,
            contextid,
            assetid
        } = getHover(id);
        
        const dateActedText = listedDateList[0].textContent;
        
        if (!dateActedText) {
            // date acted text is missing
            throw new Error('Date acted text is missing');
        }
        
        const dateListedText = listedDateList[1].textContent;
        
        if (!dateListedText) {
            // date listed text is missing
            throw new Error('Date listed text is missing');
        }
        
        const asset = getAsset(appid, contextid, assetid);
        
        if (!asset) {
            // asset is missing
            throw new Error('Asset not found');
        }
        
        const date_acted_raw = dateActedText.trim();
        const date_listed_raw = dateListedText.trim();
        const {
            date_listed,
            date_acted
        } = getDate(date_listed_raw, date_acted_raw);
        let { name_color, background_color } = asset;
        
        // name color should always be uppercase for uniformity
        if (name_color) {
            name_color = name_color.toUpperCase();
        }
        
        if (background_color) {
            background_color = background_color.toUpperCase();
        }
        
        return new Listing({
            appid,
            contextid,
            assetid,
            index,
            price,
            transaction_id: transactionId,
            price_raw: priceText,
            is_credit: isCredit ? 1 : 0,
            date_acted,
            date_acted_raw,
            date_listed,
            date_listed_raw,
            classid: asset.classid,
            instanceid: asset.instanceid,
            name: asset.name,
            market_name: asset.market_name,
            market_hash_name: asset.market_hash_name,
            icon_url: asset.icon_url,
            name_color,
            background_color
        });
    }
    
    /**
     * Calculates the index for a listing.
     * @param {number} index - Index of listing.
     * @returns {number} Calculated index.
     */
    function calcListingIndex(index) {
        if (start == null) {
            // no start index
            throw new Error('Start index is missing');
        }
        
        if (total_count == null) {
            // no total count
            throw new Error('Total count is missing');
        }
        
        return total_count - (start + index);  
    }
    
    /**
     * Gets the transaction ID from a listing element.
     * @param {Element} listingEl - Listing element.
     * @returns 
     */
    function getTransactionId(listingEl) {
        const id = listingEl.getAttribute('id');
        
        if (!id) {
            throw new Error('Listing element does not contain ID attribute');
        }
        
        return id.replace('history_row_', '').replace('_', '-');
    }
    
    /**
     * Gets parameters from hover.
     * @param {string} id - ID of listing.
     * @returns {{appid: string, contextid: string, assetid: string}} RegExp results.
     */
    function getHover(id) {
        if (!response.hovers) {
            throw new Error('Response missing hovers');
        }
        
        const pattern = new RegExp(`CreateItemHoverFromContainer\\(\\s*g_rgAssets\\s*,\\s*\\\'${id}_image\\\'\\s*,\\s*(\\d+)\\s*,\\s*\\\'(\\d+)\\\'\\s*,\\s*\\\'(\\d+)\\\'\\s*,\\s*(\\d+)\\s*\\);`);
        const match = response.hovers.match(pattern);
        
        if (!match) {
            throw new Error('Hover data not found');
        }
        
        const [ , appid, contextid, assetid] = match;
        
        return {
            appid,
            contextid,
            assetid
        };
    }
    
    /**
     * Gets dates of listing, this is a complicated process since dates are displayed in short 
     * string formats. E.g. "Mar 30", which must be manually parsed and year must be determined 
     * based on numerous conditions.
     * @param {string} dateListedRaw - Raw date listed string.
     * @param {string} dateActedRaw - Raw date acted string.
     * @returns {{ date_acted: Date, date_listed: Date }} Parsed dates.
     */
    function getDate(dateListedRaw, dateActedRaw) {
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
        const parsed = {
            date_listed: dateListedRaw && localization.parseDateString(dateListedRaw),
            date_acted: dateActedRaw && localization.parseDateString(dateActedRaw)
        };
        
        // parsing failed
        // the parsing function would normally throw an error, but in case it doesn't...
        // must have date_listed and date_acted
        if (!parsed.date_listed || !parsed.date_acted) {
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
    
    /**
     * Returns the asset for an item from `response.assets`.
     * @param {string} appid - Appid of asset.
     * @param {string} contextid - Contextid of asset.
     * @param {string} assetid - Assetid of asset.
     * @returns {Asset} Asset object. 
     */
    function getAsset(appid, contextid, assetid) {
        if (!response.assets) {
            throw new Error('Response missing assets');
        }
        
        return response.assets[appid][contextid][assetid];
    }
    
    const listingsArr = Array.from(listingsList);
    const listings = listingsToJSON(listingsArr);
    const isMissingData = listings.some((listing) => {
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
    
    if (isMissingData) {
        // fatal
        // we do not want to store bad data
        throw new Error('Invalid listing data');
    }
    
    return {
        records: listings,
        dateStore: modifiedDate
    };
}
