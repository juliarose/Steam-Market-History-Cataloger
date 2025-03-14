// @ts-check

import { AppError, AppSuccessError } from '../error.js';
import { randomString, sleep } from '../helpers/utils.js';
import { getListings } from '../steam/requests/get.js';
import { Localization } from '../models/Localization.js';
import { parseListings } from '../parsers/parseListings.js';
import { DatabaseSettingsManager } from '../storage/DatabaseSettingsManager.js';
import { EventEmitter } from '../../lib/eventemitter.js';
import { getPreferences } from '../preferences.js';
import { Dexie } from '../dexie.js';
import { PurchaseHistoryManager } from './PurchaseHistoryManager.js';

/**
 * @typedef {import('../models/Listing.js').Listing} Listing
 * @typedef {import('../steam/requests/get.js').MyHistoryResponse} MyHistoryResponse
 * @typedef {import('../account.js').Account} Account
 * @typedef {import('../models/AccountTransaction.js').AccountTransaction} AccountTransaction
 */

/**
 * Load result.
 * @typedef {Object} ListingManagerLoadResponse
 * @property {Listing[]} records - Array of listings.
 * @property {Object} progress - Load progress.
 * @property {number} progress.step - Current step.
 * @property {number} progress.total - Total steps.
 */

/**
 * Contains current month, year and day of load state. Date from last fetched listings. This is 
 * configured on reset.
 * @typedef {Object} LoadStateDate
 * @property {number} year - Year.
 * @property {number} month - Month.
 * @property {number} day - Day.
 */

/**
 * State related to loading listings.
 * @typedef {Object} LoadState
 * @property {(Listing | null)} first - First listing object, when/if available.
 * @property {(Listing | null)} last - Last listing object, when/if available.
 * @property {LoadStateDate} date - Current date of load state.
 * @property {(Listing | null)} last_fetched - The listing object at "settings.last_fetched_index".
 * @property {(Listing | null)} last_indexed - The last indexed listing.
 * @property {AccountTransaction[]} transactions - Array of Steam wallet transactions.
 */

/**
 * Configuration settings related to loading listings.
 * @typedef {Object} LoadSettings
 * @property {number} current_index - The current index to fetch listings at. For example, 0 would
 *     start at the most recent listings.
 * @property {number} total_count - The total number of history results. This is not the same as 
 *     total number of listings. It accounts for any listing action, for example listing an item, 
 *     removing an item from market.
 * @property {(number | null)} last_index - The index of the most recent listing after a 
 *     successful loop after all listings have been initially collected. This is saved after 
 *     reset is called.
 * @property {(number | null)} last_fetched_index - The index of the last obtained listing, for
 *     continuing where we left off. This is saved after "ListingManager.updateSettingsFromPage" is
 *     called.
 * @property {(number | null)} recorded_count - The recorded number of listings. This is updated 
 *     when "ListingManager.updateSettingsFromPage" is called.
 * @property {(string | null)} session - Current session hash. This is redefined at setup.
 * @property {(string | null)} language - Language of listings. This is redefined at setup and will
 *     always remain the same after it is first defined.
 * @property {boolean} is_loading - Whether loading is taking place or not. This is redefined at
 *     setup.
 * @property {Date} date - Date of last page load.
 */

/**
 * Used for managing the state of the listings.
 */
export class ListingManager extends EventEmitter {
    /**
     * State related to loading listings.
     * @type {LoadState}
     */
    #state = {
        first: null,
        last: null,
        date: {
            year: new Date().getFullYear(),
            month: new Date().getMonth(),
            day: new Date().getDate()
        },
        last_fetched: null,
        last_indexed: null,
        transactions: []
    };
    /**
     * Configuration settings related to loading listings.
     * @type {LoadSettings}
     */
    #settings = {
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
    /**
     * An array of requests made used for tracking repetitive requests. Cleared on reset.
     * @type {string[]}
     */
    #requests = [];
    /**
     * Current page loaded. Incremented after a successful page load.
     * @type {number}
     */
    #page = 0;
    /**
     * The page size used when collecting listings. Redefined at setup.
     * @type {number}
     */
    #pagesize = 100;
    /**
     * The interval to poll at between loads.
     * @type {number}
     */
    #pollInterval = 5;
    /**
     * The number we start collecting listings at. Redefined at setup.
     * @type {number}
     */
    #startIndex = 0;
    /**
     * Localization strings specific to the collection of listings. Defined in setup.
     * @type {(Localization | null)}
     */
    #locales;
    /**
     * Current load session hash. Used to detect loads from multiple locations.
     * @type {(string | null)}
     */
    #session;
    /**
     * Account. Should contain wallet currency.
     * @type {Account}
     */
    #account;
    /**
     * Settings manager.
     * @type {DatabaseSettingsManager}
     */
    #settingsManager;
    /**
     * The database storing listing data for the account. 
     * @type {Object}
     */
    #ListingDB;

    /**
     * Creates a ListingManager.
     * @param {Object} deps - Dependencies.
     * @param {Account} deps.account - Account to loading listings from. Should contain wallet currency.
     * @param {Object} deps.AccountDB - The database storing data.
     * @param {Object} deps.ListingDB - The database storing listing data for the account.
     */
    constructor({ account, AccountDB, ListingDB }) {
        super();
        
        this.#account = account;
        this.#settingsManager = new DatabaseSettingsManager(
            AccountDB,
            'listings',
            account.steamid,
            this.#settings
        );
        this.#ListingDB = ListingDB;
    }
    
    /**
     * Gets the next starting index to load from.
     * @param {number} [index=0] - Index to calculate for.
     * @returns {number} Starting index to use.
     */
    #getNextLoadIndex(index = 0) {
        return this.#settings.current_index + index;
    }
    
    /**
     * Calculates the index in reverse.
     *
     * E.g. The most recent listing would have an index of "1".
     * @param {number} [index=0] - Index to calculate for.
     * @returns {number} Index.
     */
    #calculateListingIndex(index = 0) {
        // reverse index
        // listings are fetched from newest to oldest
        // but are indexed from oldest to newest (1 being the oldest)
        return this.#settings.total_count - index;  
    }
    
    /**
     * Gets total number of page loads needed based on current state.
     * @returns {number} Total number of pages to collect based on current state.
     */
    #getTotalPages() {
        // get the number between the starting index and the starting point from the last load session
        const countToPreviousStart = (
            // check that the setting exists
            this.#settings.last_index &&
            // get the index we started loading at and offset
            this.#calculateListingIndex(this.#startIndex) - this.#settings.last_index
        );
        // get the difference between the total count and the starting index
        const countToEndIndex = this.#settings.total_count - this.#startIndex;
        // select the number of results we need to fetch in order to reach the end
        const numberOfResultsNeeded = (this.#settings.last_index ? countToPreviousStart : countToEndIndex) || 0;
        // calculate the number of pages needed
        const numberOfPagesNeeded = Math.ceil(numberOfResultsNeeded / this.#pagesize);
        
        // at least one page is needed
        if (numberOfPagesNeeded <= 0) {
            return 1;
        }
        
        return numberOfPagesNeeded;
    }
    
    /**
     * Updates settings after getting a page of new records.
     * @param {Listing[]} records - Array of records.
     * @param {number} currentIndex - The current index to fetch at.
     * @returns {Promise<void>} Resolves when done.
     */
    async #updateSettingsFromPage(records, currentIndex) {
        this.#settings.current_index = currentIndex;
        // add a page
        this.#page += 1;
        
        // has records
        if (records && records.length > 0) {
            this.#state.last_fetched = records[records.length - 1];
            this.#settings.last_fetched_index = this.#state.last_fetched.index;
        }
        
        const count = await this.#ListingDB.listings.count();
        
        this.#settings.date = new Date();
        this.#settings.recorded_count = count;
        
        await this.#saveSettings();
    }
    
    /**
     * Checks load state.
     * @returns {Promise<void>} Resolves when done, reject on error.
     */
    async #checkLoadState() {
        // Verifies saved settings with current settings.
        const settings = await this.getSettings();
        
        // sessions do not match
        if (settings.session !== this.#session) {
            // ListingManager.load was called elsewhere
            throw new AppError('Load was called elsewhere');
        }
        
        // Verifies that the language settings are configured.
        if (!settings.language) {
            throw new AppError('No language');
        }
        
        // Verifies that more listings can be loaded.
        // starting point
        const start = this.#getNextLoadIndex();
        // reached beginning of previous checked loop of listings collection
        const isBeginning = Boolean(
            this.#page > 0 &&
            settings.total_count &&
            settings.last_index &&
            this.#calculateListingIndex(start) <= settings.last_index
        );
        // reached end of count
        const isEnd = Boolean(
            settings.total_count !== 0 &&
            start >= settings.total_count
        );
        
        if (isBeginning) {
            // reset settings
            await this.reset();
            throw new AppSuccessError('Listings successfully updated!');
        } else if (isEnd) {
            // reset settings
            await this.reset();
            throw new AppSuccessError('Listings fully loaded!');
        }
    }
    
    /**
     * Adds records and updates settings on a successful response.
     * @param {Listing[]} records - Array of records.
     * @param {number} next - Next index to load.
     * @returns {Promise<ListingManagerLoadResponse>} Resolves with response when done.
     */
    async #onRecords(records, next) {
        // Add records to the database
        await (async () => {
            return new Promise((resolve) => {
                if (records && records.length > 0) {
                    this.#ListingDB.listings.bulkAdd(records)
                        // @ts-ignore
                        // I believe this should be here but ts-check does not recognize it
                        .catch(Dexie.BulkError, () => {
                            // do nothing
                        })
                        .finally(resolve);
                } else {
                    // no records
                    return resolve(null);
                }
            });
        })();
        // update the settings from the newly collected records
        // and update the current index
        await this.#updateSettingsFromPage(records, next);
        
        return {
            records,
            progress: {
                step: this.#page,
                total: this.#getTotalPages()
            }
        };
    }
    
    /**
     * Fetch market transaction history result page.
     * @param {number} start - Index of listings to load from.
     * @param {number} count - Number of listings to load per page.
     * @param {string} language - Language to load.
     * @returns {Promise<MyHistoryResponse>} Response JSON from Steam on resolve, error with details on reject.
     */
    async #getListings(start, count, language) {
        if (isNaN(start)) {
            throw new AppError('Start should be a number');
        }
        
        this.#requests.push(`${count}:${start}:${language}`);
        
        // used for detecting requests that are repetitive
        // this may be due to a bug or a change in steam's responses
        // this can act as a safe-guard so the extension does not spam requests
        const lastRequests = this.#requests.slice(-10);
        const isRepetitiveRequests = Boolean(
            lastRequests.length === 10 &&
            lastRequests.every((request) => request === lastRequests[0])
        );
        
        if (isRepetitiveRequests){
            throw new AppError('Too many errors');
        }
        
        const response = await getListings({
            count,
            start,
            l: language
        });
        
        if (!response.ok) {
            throw new AppError(response.statusText);
        }
        
        const body = await response.json();
        
        if (!body.success) {
            throw new AppError(body.error || body.message || 'Response failed');
        }
        
        return body;
    }
    
    /**
     * Parses response based on current state.
     * @param {MyHistoryResponse} response - Response object from Steam.
     * @returns {Object} Object containing parse results.
     */
    #parse(response) {
        /**
         * Checks a parse result.
         * @param {Listing[]} records - Array of records.
         * @param {number} difference - Difference between stored and updated counts.
         * @param {string} [error] - Error string.
         * @param {boolean} [fatal] - Whether the error is fatal.
         * @returns {Object} Parse result.
         */
        const onParse = (records, difference, error, fatal) => {
            // not a fatal error
            const shouldRetry = Boolean(
                error &&
                !fatal
            );
            
            // get the page number
            const page = (Math.floor(difference / this.#pagesize) - 1);
            // minus 1 for current page
            const offset = page * this.#pagesize;
            // add on success
            const next = this.#getNextLoadIndex(Math.max(offset, this.#pagesize));
            
            return {
                records,
                next,
                error,
                shouldRetry
            }; 
        };
        let difference = 0;
        
        if (response.total_count != null) {
            // the difference between the count from response and count from storage
            difference = response.total_count - this.#settings.total_count;
            // update values from response
            this.#settings.total_count = response.total_count;
            // when the response count is further ahead from previous load
            // (big difference between stored and updated counts)
            // e.g.
            // stored total count shows 100 (prior total count)
            // response total count shows 1000 (current total count)
            // difference is 900 (1000 - 100)
            // pagesize is 100
            // if difference (900) > pagesize (100) ... big difference
            // however, this only counts when the index we are fetching at is not 0
            const isBigDifference = Boolean(
                difference >= this.#pagesize &&
                this.#settings.current_index !== 0
            );
        
            if (isBigDifference) {
                // no use in going through listings
                // we will set the new current index using the difference
                return onParse([], difference);
            }
        }
        
        if (!this.#locales) {
            throw new AppError('No locales set in listing manager.');
        }
        
        const currency = this.#account.wallet.currency;
        const {
            error,
            fatal,
            records,
            dateStore
        } = parseListings(response, this.#state, currency, this.#locales, this.#state.transactions);
        
        if (dateStore) {
            // update date store
            this.#state.date = dateStore;
        }
        
        if (response.start === 0) {
            // we don't want to shift difference when the start is 0
            difference = 0;
        }
        
        return onParse(records, difference, error, fatal);
    }
    
    /**
     * Saves settings.
     * @returns {Promise<void>} Resolves when done.
     */
    async #saveSettings() {
        return this.#settingsManager.saveSettings(this.#settings);
    }
    
    /**
     * Gets the current settings.
     * @returns {Promise<Object>} Resolves with settings.
     */
    async getSettings() {
        // update the settings
        this.#settings = await this.#settingsManager.getSettings();
        
        return this.#settings;
    }
    
    /**
     * Deletes the current settings.
     * @returns {Promise<void>} Resolves when done.
     */
    async deleteSettings() {
        return this.#settingsManager.deleteSettings();
    }
    
    /**
     * Resets settings.
     * @returns {Promise<void>} Resolves when done.
     */
    async reset() {
        const last = await this.#ListingDB.listings.orderBy('index').last();
        
        // reset dates
        this.#state.date = {
            year: new Date().getFullYear(),
            month: new Date().getMonth(),
            day: new Date().getDate()
        };
        
        // reset index
        this.#settings.current_index = 0;
        
        if (last) {
            this.#settings.last_index = last.index;
        }
        
        this.#settings.last_fetched_index = null;
        this.#requests = [];
        
        await this.#saveSettings();
        
        return;
    }

    /**
     * Loads market history.
     * @param {number} [delay=0] - Delay in Seconds to load.
     * @param {boolean} [loadInstantly=false] - Whether to load instantly or not.
     * @returns {Promise<ListingManagerLoadResponse>} Resolves with response when done.
     */
    async load(delay = 0, loadInstantly = false) {
        const retry = async (error, seconds) => {
            if (error) {
                console.warn('GET [error] listings:', error);
            }
            
            // load more data
            return this.load(seconds);
        };
        const parseListings = async (response) => {
            const {
                records,
                next,
                error,
                shouldRetry
            } = this.#parse(response);
            
            if (shouldRetry) {
                // there was an error where we should retry
                return retry(error, 15);
            } else if (error) {
                // fatal error
                return Promise.reject(error);
            }
            
            // all good
            return this.#onRecords(records, next);
        };
        
        if (loadInstantly) {
            delay = 0;
        } else {
            delay = (delay || this.#pollInterval) * 1000;
        }
        
        // check the current load state to see whether we can load or not
        await this.#checkLoadState();
        
        // delay to space out requests
        await sleep(delay);
        
        // then we can load
        try {
            const start = this.#getNextLoadIndex();
            const count = this.#pagesize;
            const { language } = this.#settings;
            
            if (!language) {
                throw new AppError('No language');
            }
            
            const response = await this.#getListings(start, count, language);
            
            return parseListings(response);
        } catch (error) {
            // retry if there is an error
            return retry(error);
        }
    }
    
    /**
     * Configures the module.
     * @returns {Promise<void>} Resolves when done, reject on fail.
     */
    async setup() {
        // get the current settings
        this.#settings = await this.getSettings();
        
        if (!this.#settings.language) {
            this.#settings.language = this.#account.language;
        }
        
        if (!this.#settings.current_index) {
            this.#settings.current_index = 0;
        }
        
        // then set start to current index from loaded settings
        this.#startIndex = this.#settings.current_index;
        // assign a random string for our load session
        // this is used when detecting loads from multiple locations
        this.#settings.session = randomString(10);
        this.#session = this.#settings.session;
        
        if (!this.#settings.language) {
            // language configuration is a MUST
            // this will lock down the language from the first load
            // and will not change regardless of what language the user selects on Steam
            throw new AppError('No language detected when configuring ListingManager');
        }
        
        // Gets locales for the language listings are loaded in
        this.#locales = await Localization.get(this.#settings.language);

        const purchaseHistoryManager = new PurchaseHistoryManager({ account: this.#account });

        const loadTransactions = async () => {
            let total = [];
            function done(error) {
                console.log(error || 'All done!');
            }
        
            async function loadT(cursor, delay = 0){
                async function getMore({ records, cursor = null }) {
                    onRecords(records);
                    
                    // if the response contained the cursor for the next page
                    if (cursor) {
                        // call the load function again
                        await loadT(cursor, 3);
                    } else {
                        // otherwise we have nothing more to load
                        done('All done!');
                    }
                }
                
                await purchaseHistoryManager.load(cursor, delay)
                    .then(getMore)
                    .catch(done);
            }

        
            function onRecords(records) {
                total = total.concat(records);
            }
        
            await purchaseHistoryManager.setup();
            await loadT();
            return total;
        };
        
        const transactions = await loadTransactions();
        if (transactions != null) {
            this.#state.transactions = transactions;
        }
        
        // Gets indexes from stored listings.
        const [
            first,
            last,
            last_fetched,
            last_indexed
        ] = await Promise.all([
            // get first listing
            this.#ListingDB.listings.orderBy('index').first(),
            // get last listing
            this.#ListingDB.listings.orderBy('index').last(),
            // get the listing at last_fetched_index, if available
            new Promise((resolve) => {
                if (this.#settings.last_fetched_index != null) {
                    this.#ListingDB.listings
                        .where('index')
                        .equals(this.#settings.last_fetched_index)
                        .first(resolve);
                } else {
                    resolve(null);
                }
            }),
            // get the listing at last_index, if available
            new Promise((resolve) => {
                if (this.#settings.last_index != null) {
                    this.#ListingDB.listings
                        .where('index')
                        .equals(this.#settings.last_index)
                        .first(resolve);
                } else {
                    resolve(null);
                }
            })
        ]);
        
        if (first != null) {
            this.#state.first = first;
        }
        
        if (last != null) {
            this.#state.last = last;
        }
        
        if (last_fetched != null) {
            this.#state.last_fetched = last_fetched;
        }
        
        if (last_indexed != null) {
            this.#state.last_indexed = last_indexed;
        }
        
        if (first != null && last_indexed == null) {
            // take the date from the first indexed listing
            this.#state.date.year = first.date_acted.getFullYear();
            this.#state.date.month = first.date_acted.getMonth();
        } else if (last_fetched) {
            // take the date from the last fetched listing
            this.#state.date.year = last_fetched.date_acted.getFullYear();
            this.#state.date.month = last_fetched.date_acted.getMonth();
        }
        
        // use preferences
        const {
            market_per_page,
            market_poll_interval_seconds
        } = await getPreferences();
        
        if (market_per_page) {
            this.#pagesize = market_per_page;
        }
        
        if (market_poll_interval_seconds) {
            this.#pollInterval = market_poll_interval_seconds;
        }
        
        await this.#saveSettings();
        
        return;
    }
}
