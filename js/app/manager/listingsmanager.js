'use strict';

import { randomString, pickKeys, sleep } from '../helpers/utils.js';
import { Steam } from '../steam/steam.js';
import { Localization } from '../classes/localization.js';
import { parseListings } from '../parsers/parseListings.js';
import { createDatabaseSettingsManager } from './storage/db.js';
import { EventEmitter } from '../../lib/eventemitter.js';

/**
 * Creates a ListingManager.
 * @param {Object} deps - Dependencies.
 * @param {Object} deps.account - Account to loading listings from. Should contain wallet currency.
 * @param {Object} deps.AccountDB - The database storing data.
 * @param {Object} deps.ListingDB - The database storing listing data for the account.
 * @returns {ListingManager} A new PurchaseHistoryManager.
 */
export function createListingManager({ account, preferences, AccountDB, ListingDB }) {
    /**
     * Gets the next starting index to load from.
     * @param {number} index - Index to calculate for.
     * @returns {number} Starting index to use.
     */
    function getNextLoadIndex(index = 0) {
        return settings.current_index + index;
    }
    
    /**
     * Calculates the index in reverse.
     *
     * E.g. The most recent listing would have an index of "1".
     * @param {number} index - Index to calculate for.
     * @returns {number} Index.
     */
    function calculateListingIndex(index = 0) {
        // reverse index
        // listings are fetched from newest to oldest
        // but are indexed from oldest to newest (1 being the oldest)
        return settings.total_count - index;  
    }
    
    /**
     * Gets total number of page loads needed based on current state.
     * @returns {number} Total number of pages to collect based on current state.
     */
    function getTotalPages() {
        // get the number between the starting index and the starting point from the last load session
        const countToPreviousStart = (
            // check that the setting exists
            settings.last_index &&
            // get the index we started loading at and offset
            calculateListingIndex(startIndex) - settings.last_index
        );
        // get the difference between the total count and the starting index
        const countToEndIndex = settings.total_count - startIndex;
        // select the number of results we need to fetch in order to reach the end
        const numberOfResultsNeeded = settings.last_index ? countToPreviousStart : countToEndIndex;
        
        // calculate the number of pages needed
        return Math.max(1, Math.ceil(numberOfResultsNeeded / pagesize));
    }
    
    /**
     * Updates settings after getting a page of new records.
     * @param {Listing[]} records - Array of records.
     * @param {number} currentIndex - The current index to fetch at.
     * @returns {Promise.<ListingManagerLoadResponse>} Resolve when done.
     */
    async function updateSettingsFromPage(records, currentIndex) {
        settings.current_index = currentIndex;
        // add a page
        page += 1;
        
        // has records
        if (records && records.length > 0) {
            store.last_fetched = records[records.length - 1];
            
            settings.last_fetched_index = store.last_fetched.index;
        }
        
        const count = await ListingDB.listings.count();
        
        settings.date = new Date();
        settings.recorded_count = count;
        
        await saveSettings(settings);
        
        return;
    }
    
    /**
     * Checks load state.
     * @returns {Promise} Resolve when done, reject on error.
     */
    async function checkLoadState() {
        // resets then rejects with a message
        async function resetAndReject(message) {
            await reset();
            
            return Promise.reject(message);
        }
        
        // Verifies saved settings with current settings.
        const settings = await getSettings();
        // sessions do not match
        const sessionChanged = Boolean(
            // compare it with the most recently saved session
            settings.session !== session
        );
        
        if (sessionChanged) {
            // ListingManager.load was called elsewhere
            return Promise.reject('Load was called elsewhere');
        }
        
        // Verifies that the language settings are configured.
        if (!settings.language) {
            return Promise.reject('No language');
        }
        
        // Verifies that more listings can be loaded.
        // starting point
        const start = getNextLoadIndex();
        // reached beginning of previous checked loop of listings collection
        const isBeginning = Boolean(
            page > 0 &&
            settings.total_count &&
            settings.last_index &&
            calculateListingIndex(start) <= settings.last_index
        );
        // reached end of count
        const isEnd = Boolean(
            settings.total_count !== 0 &&
            start >= settings.total_count
        );
        
        if (isBeginning) {
            // reset settings
            return resetAndReject('Listings successfully updated!');
        } else if (isEnd) {
            // reset settings
            return resetAndReject('Listings fully loaded!');
        }
        
        return;
    }
    
    /**
     * Adds records and updates settings on a successful response.
     * @param {Listing[]} records - Array of records.
     * @param {number} next - Next index to load.
     * @returns {Promise.<ListingManagerLoadResponse>} Resolves with response when done.
     */
    async function onRecords(records, next) {
        /**
         * Adds records.
         * @param {Listing[]} records - Array of records.
         * @returns {Promise} Resolve when done.
         */
        async function addRecords(records) {
            return new Promise((resolve) => {
                const canAdd = Boolean(
                    records &&
                    records.length > 0
                );
                
                if (canAdd) {
                    ListingDB.listings.bulkAdd(records)
                        .catch(Dexie.BulkError, () => {
                            // do nothing
                        })
                        .finally(resolve);
                } else {
                    return resolve();
                }
            });
        }
        
        await addRecords(records);
        // update the settings from the newly collected records
        // and update the current index
        await updateSettingsFromPage(records, next);
        
        /**
         * Load result.
         * @typedef {Object} ListingManagerLoadResponse
         * @property {Listing[]} records - Array of listings.
         * @property {Object} progress - Load progress.
         * @property {number} progress.step = Current step.
         * @property {number} progress.total - Total steps.
         */
        return {
            records,
            progress: {
                step: page,
                total: getTotalPages()
            }
        };
    }
    
    /**
     * Fetch market transaction history result page.
     * @param {number} start - Index of listings to load from.
     * @param {number} count - Number of listings to load per page.
     * @param {string} language - Language to load.
     * @returns {Promise.<Object>} Response JSON from Steam on resolve, error with details on reject.
     */
    async function getListings(start, count, language) {
        if (isNaN(start)) {
            throw Error('Start should be a number');
        }
        
        requests.push([count, start, language].join(':'));
        
        // used for detecting requests that are repetitive
        // this may be due to a bug or a change in steam's responses
        // this can act as a safe-guard so the extension does not spam requests
        const lastRequests = requests.slice(-10);
        const repetitiveRequests = Boolean(
            lastRequests.length === 10 &&
            lastRequests.every((request) => request === lastRequests[0])
        );
        
        if (repetitiveRequests){
            return Promise.reject('Too many errors');
        }
        
        const response = await Steam.requests.get.listings({
            count,
            start,
            l: language
        });
        
        if (!response.ok) {
            return Promise.reject(response.statusText);
        }
        
        const body = await response.json();
        
        if (!body.success) {
            return Promise.reject(body.error || body.message || 'Response failed');
        }
        
        return body;
    }
    
    /**
     * Parses response based on current state.
     * @param {Object} response - Response object from Steam.
     * @returns {Object} Object containing parsing results.
     */
    function parse(response) {
        const onParse = (error, fatal, records, difference) => {
            // not a fatal error
            const shouldRetry = Boolean(
                error &&
                !fatal
            );
            
            // get the page number
            const page = (Math.floor(difference / pagesize) - 1);
            // minus 1 for current page
            const offset = page * pagesize;
            // add on success
            const next = getNextLoadIndex(Math.max(offset, pagesize));
            
            return {
                records,
                next,
                error,
                shouldRetry
            }; 
        };
        const currency = account.wallet.currency;
        // total count from settings
        const managerTotalCount = settings.total_count;
        // total count from response
        const responseTotalCount = response.total_count;
        // start from response
        const responseStart = response.start;
        let difference = 0;
        let isBigDifference;
        
        if (responseTotalCount != null) {
            // the difference between the count from response and count from storage
            difference = responseTotalCount - managerTotalCount;
            // update values from response
            settings.total_count = responseTotalCount;
            // when the response count is further ahead from previous load
            // (big difference between stored and updated counts)
            // e.g.
            // stored total count shows 100 (prior total count)
            // response total count shows 1000 (current total count)
            // difference is 900 (1000 - 100)
            // pagesize is 100
            // if difference (900) > pagesize (100) ... big difference
            // however, this only counts when the index we are fetching at is not 0
            isBigDifference = Boolean(
                difference >= pagesize &&
                settings.current_index !== 0
            );
        }
        
        if (isBigDifference) {
            // no use in going through listings
            // we will set the new current index using the difference
            return onParse(null, null, [], difference);
        }
        
        const {
            error,
            fatal,
            records,
            dateStore
        } = parseListings(response, store, currency, locales);
        
        if (dateStore) {
            // update date store
            store.date = dateStore;
        }
        
        if (responseStart === 0) {
            // we don't want to shift difference when the start is 0
            difference = 0;
        }
        
        return onParse(error, fatal, records, difference);
    }
    
    /**
     * Saves settings.
     * @param {object} settings - Settings to save.
     * @returns {Promise} Resolve when done.
     */
    async function saveSettings(settings) {
        return settingsManager.saveSettings(settings);
    }
    
    /**
     * Gets the current settings.
     * @memberOf ListingManager
     * @namespace ListingManager.getSettings
     * @returns {Promise.<object>} Resolve with settings.
     */
    async function getSettings() {
        // update the settings
        settings = await settingsManager.getSettings();
        
        return settings;
    }
    
    /**
     * Deletes the current settings.
     * @memberOf ListingManager
     * @namespace ListingManager.deleteSettings
     * @returns {Promise} Resolve when done.
     */
    async function deleteSettings() {
        return settingsManager.deleteSettings();
    }
    
    /**
     * Resets settings.
     * @memberOf ListingManager
     * @namespace ListingManager.reset
     * @returns {Promise} Resolve when done.
     */
    async function reset() {
        const last = await ListingDB.listings.orderBy('index').last();
        
        // reset dates
        store.date = {
            year: new Date().getFullYear(),
            month: new Date().getMonth()
        };
        
        // reset index
        settings.current_index = 0;
        
        if (last) {
            settings.last_index = last.index;
        }
        
        settings.last_fetched_index = null;
        requests = [];
        
        await saveSettings(settings);
        
        return;
    }
    
    /**
     * Loads market history.
     * @memberOf ListingManager
     * @namespace ListingManager.load
     * @param {number} [delay=0] - Delay in Seconds to load.
     * @param {boolean} [loadInstantly=false] - Whether to load instantly or not.
     * @returns {Promise.<ListingManagerLoadResponse>} Resolves with response when done.
     */
    async function load(delay = 0, loadInstantly = false) {
        if (loadInstantly) {
            delay = 0;
        } else {
            delay = (delay || pollInterval) * 1000;
        }
        
        async function retry(error, seconds) {
            if (error) {
                console.log('GET [error] listings:', error);
            }
            
            // load more data
            return load(seconds);
        }
        
        async function startLoading() {
            async function fetchListings() {
                const start = getNextLoadIndex();
                const count = pagesize;
                const { language } = settings;
                
                return getListings(start, count, language);
            }
            
            async function parseListings(response) {
                const {
                    records,
                    next,
                    error,
                    shouldRetry
                } = parse(response);
                
                if (shouldRetry) {
                    // there was an error where we should retry
                    return retry(error, 15);
                } else if (error) {
                    // fatal error
                    return Promise.reject(error);
                }
                
                // all good
                return onRecords(records, next);
            }
            
            try {
                const response = await fetchListings();
                
                return parseListings(response);
            } catch (error) {
                // retry if there is an error
                return retry(error);
            }
        }
        
        // check the current load state to see whether we can load or not
        await checkLoadState();
        
        // delay it to space out requests
        await sleep(delay);
        
        // then we can load
        return startLoading();
    }
    
    /**
     * Configures the module.
     * @memberOf ListingManager
     * @namespace ListingManager.setup
     * @returns {Promise} Resolve when done, reject on fail.
     */
    async function setup() {
        // get the current settings
        settings = await getSettings();
        
        if (!settings.language) {
            settings.language = account.language;
        }
        
        if (!settings.current_index) {
            settings.current_index = 0;
        }
        
        // then set start to current index from loaded settings
        startIndex = settings.current_index;
        // assign a random string for our load session
        // this is used when detecting loads from multiple locations
        settings.session = randomString(10);
        session = settings.session;
        
        if (!settings.language) {
            // language configuration is a MUST
            // this will lock down the language from the first load
            // and will not change regardless of what language the user selects on Steam
            return Promise.reject('No language detected when configuring ListingManager');
        }
        
        // Gets locales for the language listings are loaded in
        locales = await Localization.get(settings.language);
        
        // Gets indexes from stored listings.
        // get first listing
        const firstListingPromise = ListingDB.listings.orderBy('index').first();
        // get last listing
        const lastListingPromise = ListingDB.listings.orderBy('index').last();
        // get the listing at last_fetched_index, if available
        const lastFetchedPromise = new Promise((resolve) => {
            if (settings.last_fetched_index != null) {
                ListingDB.listings
                    .where('index')
                    .equals(settings.last_fetched_index)
                    .first(resolve);
            } else {
                resolve();
            }
        });
        // get the listing at last_index, if available
        const lastIndexPromise = new Promise((resolve) => {
            if (settings.last_index != null) {
                ListingDB.listings
                    .where('index')
                    .equals(settings.last_index)
                    .first(resolve);
            } else {
                resolve();
            }
        });
        
        const [
            first,
            last,
            last_fetched,
            last_indexed
        ] = await Promise.all([
            firstListingPromise,
            lastListingPromise,
            lastFetchedPromise,
            lastIndexPromise
        ]);
        
        if (first != null) {
            store.first = first;
        }
        
        if (last != null) {
            store.last = last;
        }
        
        if (last_fetched != null) {
            store.last_fetched = last_fetched;
        }
        
        if (last_indexed != null) {
            store.last_indexed = last_indexed;
        }
        
        if (first != null && last_indexed == null) {
            // take the date from the first indexed listing
            store.date.year = first.date_acted.getFullYear();
            store.date.month = first.date_acted.getMonth();
        } else if (last_fetched) {
            // take the date from the last fetched listing
            store.date.year = last_fetched.date_acted.getFullYear();
            store.date.month = last_fetched.date_acted.getMonth();
        }
        
        // use preferneces
        const preferenceSettings = await preferences.getSettings();
        
        if (preferenceSettings.market_per_page) {
            pagesize = parseInt(preferenceSettings.market_per_page);
        }
        
        if (preferenceSettings.market_poll_interval) {
            pollInterval = parseInt(preferenceSettings.market_poll_interval_seconds);
        }
        
        await saveSettings(settings);
        
        return;
    }
    
    /**
     * Temp storage of data related to loading listings.
     * @typedef {Object} ListingManagerStore
     * @property {(Object|null)} first - First listing object, when/if available.
     * @property {(Object|null)} last - Last listing object, when/if available.
     * @property {Object} date - Object containing current month and year of load state.
     * @property {(Object|null)} last_fetched - The listing object at "settings.last_index".
     *     This is set after "ListingManager.getIndexListings", or after a page of
     *     listings has been fetched. It will be the last listing in the results.
     * @property {(Object|null)} last_indexed - The listing object at "settings.last_fetched_index".
     *     This is only set after "ListingManager.getIndexListings".
     */
    let store = {
        // the first indexed listing
        first: null,
        // the last indexed listing
        last: null,
        // date from last fetched listings
        // this is configured on reset
        date: {
            // year
            year: new Date().getFullYear(),
            // month
            month: new Date().getMonth()
        }
    };
    /**
     * Settings for loading listings.
     * @typedef {Object} ListingManagerSettings
     * @property {number} current_index - The current index to fetch listings at. 
     *     For example, 0 would start at the most recent listings.
     * @property {number} total_count - Total number of history results. This is not 
     *     the same as total number of listings. It accounts for any listing action 
     *     (e.g. listing an item, removing an item from market).
     * @property {(Number|null)} last_index - The index of the most recent listing after
     *     a successful loop after all listings have been initially collected. This is saved
     *     after reset is called.
     * @property {(Number|null)} last_fetched_index - The index of the last obtained listing,
     *     for continuing where we left off. This is saved after
     *     "ListingManager.updateSettingsFromPage" is called.
     * @property {(Number|null)} recorded_count - The recorded number of listings.
     *     This is updated when "ListingManager.updateSettingsFromPage" is called.
     * @property {(String|null)} session - Current session hash. This is redefined at setup.
     * @property {(String|null)} language - Language of listings. This is redefined at setup
     *     and will always remain the same after it is first defined 
     * @property {boolean} is_loading - Whether loading is taking place or not.
     *     This is redefined at setup.
     * @property {Date} date - Date of last page load
     */
    let settings = {
        current_index: 0,
        total_count: 0,
        last_index: null,
        last_fetched_index: null,
        recorded_count: null,
        session: null,
        language: null,
        is_loading: false,
        date: new Date()
    };
    // An array of requests made used for tracking repetitive requests. Cleared on reset.
    let requests = [];
    // Current page loaded. Incremented after a successful page load.
    let page = 0;
    // The page size used when collecting listings. Redefined at setup.
    let pagesize = 100;
    // The interval to poll at between loads.
    let pollInterval = 5;
    // The number we start collecting listings at. Redefined at setup.
    let startIndex = 0;
    // Localization strings specific to the collection of listings. Defined in setup.
    let locales = null;
    // Current load session hash. Used to detect loads from multiple locations.
    let session = null;
    // Used for managing settings.
    const settingsManager = createDatabaseSettingsManager(AccountDB, 'listings', account.steamid, settings);
    
    /**
     * Module for loading & parsing listings from Steam.
     * 
     * Must be logged in to use.
     * @class ListingManager
     */
    return Object.assign(
        {},
        EventEmitter.prototype,
        {
            setup,
            reset,
            load,
            getSettings,
            deleteSettings
        }
    );
}