'use strict';

import {randomString, pickKeys, delayPromise} from '../helpers/utils.js';
import {Steam} from '../steam/steam.js';
import {Localization} from '../classes/localization.js';
import {createManager} from './helpers/createManager.js';
import {parseListings} from '../parsers/parseListings.js';

/**
 * Creates a ListingManager.
 * @param {Object} deps - Dependencies.
 * @param {Object} deps.account - Account to loading listings from. Should contain wallet currency.
 * @param {Object} deps.AccountDB - The database storing data.
 * @param {Object} deps.ListingDB - The database storing listing data for the account.
 * @returns {ListingManager} A new PurchaseHistoryManager.
 */
function createListingManager({account, preferences, AccountDB, ListingDB}) {
    /**
     * Module for loading & parsing listings from Steam.
     * 
     * Must be logged in to use.
     * @class ListingManager
     * @type {Manager}
     * @property {String} table_name - Name of related table.
     * @property {Number} start_index - The number we start collecting listings at.
     *     This is redefined at "ListingManager.setup".
     * @property {Number} pagesize - The page size used when collecting listings. This is redefined at setup.
     * @property {Number} page - Current page loaded. Incremented after a successful page load.
     * @property {String} session - Current load session hash. Used to detect loads from multiple locations.
     */
    return createManager({
        table_name: 'listings',
        start_index: 0,
        pagesize: 100,
        poll_interval: 5,
        page: 0,
        session: null,
        locales: new Localization(),
        /**
         * Settings for loading listings.
         * @namespace ListingManager.settings
         * @memberOf ListingManager
         * @property {Number} current_index - The current index to fetch listings at. 
         *     For example, 0 would start at the most recent listings.
         * @property {Number} total_count - Total number of history results. This is not 
         *     the same as total number of listings. It accounts for any listing action 
         *     (e.g. listing an item, removing an item from market).
         * @property {(Number|null)} last_index - The index of the most recent listing after
         *     a successful loop after all listings have been initially collected. This is saved
         *     after "ListingManager.reset" is called
         * @property {(Number|null)} last_fetched_index - The index of the last obtained listing,
         *     for continuing where we left off. This is saved after
         *     "ListingManager.updateSettingsFromPage" is called.
         * @property {(Number|null)} recorded_count - The recorded number of listings.
         *     This is updated when "ListingManager.updateSettingsFromPage" is called.
         * @property {(String|null)} session - Current session hash. This is redefined
         *     at "ListingManager.setup".
         * @property {(String|null)} language - Language of listings. This is redefined at
         *     "ListingManager.setup" and will always remain the same after it is first defined 
         * @property {Boolean} is_loading - Whether loading is taking place or not.
         *     This is redefined at "ListingManager.setup"
         * @property {Date} date - Date of last page load
         */
        settings: {
            current_index: 0,
            total_count: 0,
            last_index: null,
            last_fetched_index: null,
            recorded_count: null,
            session: null,
            language: null,
            is_loading: false,
            date: new Date()
        },
        /**
         * Temp storage of data related to loading listings.
         * @namespace ListingManager.store
         * @memberOf ListingManager
         * @property {(Object|null)} first - First listing object, when/if available.
         * @property {(Object|null)} last - Last listing object, when/if available.
         * @property {Object} date - Object containing current month and year of load state.
         * @property {(Object|null)} last_fetched - The listing object at "settings.last_index".
         *     This is set after "ListingManager.getIndexListings", or after a page of
         *     listings has been fetched. It will be the last listing in the results.
         * @property {(Object|null)} last_indexed - The listing object at "settings.last_fetched_index".
         *     This is only set after "ListingManager.getIndexListings".
         */
        store: {
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
        },
        /**
         * Gets locales for this module's language.
         * @memberOf ListingManager
         * @returns {Promise} Resolve when done, reject on error.
         */
        getLocales: function() {
            return this.locales.get(this.language);
        },
        /**
         * Resets settings.
         * @memberOf ListingManager
         * @returns {Promise} Resolve when done.
         */
        reset: function() {
            return ListingDB.listings.orderBy('index').last()
                .then((last) => {
                    // reset dates
                    this.store.date = {
                        year: new Date().getFullYear(),
                        month: new Date().getMonth()
                    };
                    
                    // reset index
                    this.settings.current_index = 0;
                    
                    if (last) {
                        this.settings.last_index = last.index;
                    }
                    
                    this.settings.last_fetched_index = null;
                    
                    return this.saveSettings();
                });
        },
        /**
         * Loads preferences and adds them to the manager.
         * @memberOf ListingManager
         * @returns {Promise} Resolve when done.
         */
        addPreferences: function() {
            return preferences.getSettings(true)
                .then((settings) => {
                    if (settings.market_per_page) {
                        this.pagesize = parseInt(settings.market_per_page);
                    }
                    
                    if (settings.market_poll_interval) {
                        this.poll_interval = parseInt(settings.market_poll_interval_seconds);
                    }
                    
                    return settings;
                });
        },
        /**
         * Gets the settings.
         * @memberOf ListingManager
         * @param {Boolean} noWrapper - Get settings object without wrapper.
         * @returns {Promise.<Object>} Resolve with settings when done.
         */
        getSettings: function() {
            // get settings
            return AccountDB.listings.get(account.steamid)
                .then((record) => {
                    if (record) {
                        // merge
                        this.settings = Object.assign(this.settings, record);
                    }
                    
                    return this.settings;
                });
        },
        /**
         * Saves the settings.
         * @memberOf Settings
         * @returns {Promise} Resolve when done.
         */
        saveSettings: function() {
            // the full data set
            const fullData = Object.assign({
                steamid: account.steamid
            }, this.settings);
            // the columns from the schema
            const columns = [
                AccountDB.listings.schema.primKey,
                ...AccountDB.listings.schema.indexes
            ].filter(Boolean).map(index => index.keyPath);
            // the data set with only the database columns
            const data = pickKeys(fullData, columns);
            
            // add or update the data on the database
            return AccountDB.listings.put(data);
        },
        /**
         * Configures the module.
         * @memberOf ListingManager
         * @returns {Promise} Resolve when done, reject on fail.
         */
        setup: function() {
            return this.getSettings()
                .then(() => {
                    if (!this.settings.language) {
                        this.settings.language = account.language;
                    }
                    
                    // then set start to current index from loaded settings
                    this.start_index = this.settings.current_index || 0;
                    this.page = 0;
                    this.language = this.settings.language;
                    // assign a random string for our load session
                    // this is used when detecting loads from multiple locations
                    this.settings.session = randomString(10);
                    this.session = this.settings.session;
                    
                    if (!this.language) {
                        // language configuration is a MUST
                        // this will lock down the language from the first load
                        // and will  not change regardless of what language the user selects on Steam
                        return Promise.reject('No language detected when configuring ListingManager');
                    }
                    
                    return this.getLocales();
                })
                .then(() => {
                    return this.getIndexListings();
                })
                .then(() => {
                    return this.addPreferences();
                })
                .then(() => {
                    return this.saveSettings();
                });
        },
        /*
         * Gets indexes from stored listings
         * @memberOf ListingManager
         * @returns {Promise} Resolve when done
         */
        getIndexListings: function() {
            // get first listing
            const firstListingPromise = ListingDB.listings.orderBy('index').first();
            // get last listing
            const lastListingPromise = ListingDB.listings.orderBy('index').last();
            // get the listing at last_fetched_index, if available
            const lastFetchedPromise = new Promise((resolve) => {
                if (this.settings.last_fetched_index != null) {
                    ListingDB.listings.where('index').equals(this.settings.last_fetched_index).first(resolve);
                } else {
                    resolve();
                }
            });
            // get the listing at last_index, if available
            const lastIndexPromise = new Promise((resolve) => {
                if (this.settings.last_index != null) {
                    ListingDB.listings.where('index').equals(this.settings.last_index).first(resolve);
                } else {
                    resolve();
                }
            });
            
            Promise.all([
                firstListingPromise,
                lastListingPromise,
                lastFetchedPromise,
                lastIndexPromise
            ]).then(([first, last, last_fetched, last_indexed]) => {
                if (first != null) {
                    this.store.first = first;
                }
                
                if (last != null) {
                    this.store.last = last;
                }
                
                if (last_fetched != null) {
                    this.store.last_fetched = last_fetched;
                }
                
                if (last_indexed != null) {
                    this.store.last_indexed = last_indexed;
                }
                
                if (first != null && last_indexed == null) {
                    // take the date from the first indexed listing
                    this.store.date.year = first.date_acted.getFullYear();
                    this.store.date.month = first.date_acted.getMonth();
                } else if (last_fetched) {
                    // take the date from the last fetched listing
                    this.store.date.year = last_fetched.date_acted.getFullYear();
                    this.store.date.month = last_fetched.date_acted.getMonth();
                }
            });
        },
        /**
         * Loads market history.
         * @memberOf ListingManager
         * @namespace ListingManager.load
         * @param {Number} [delay=0] - Delay in Seconds to load.
         * @returns {Promise.<ListingManagerLoadResponse>} Resolves with response when done.
         */
        load: function(delay = 0) {
            const manager = this;
            
            const retry = (error, seconds) => {
                if (error) {
                    console.log('GET [error] listings:', error);
                }
                
                // load more data
                return manager.load(
                    seconds ||
                    delay ||
                    manager.poll_interval
                );
            };
            const load = () => {
                const getListings = () => {
                    const start = manager.nextLoadIndex();
                    const count = manager.pagesize;
                    const language = manager.language;
                    
                    return manager.get(start, count, language);
                };
                const parse = (response) => {
                    const {
                        records,
                        next,
                        error,
                        shouldRetry
                    } = manager.parse(response);
                    
                    if (shouldRetry) {
                        // there was an error where we should retry
                        return retry(error, 15);
                    } else if (error) {
                        // fatal error
                        return Promise.reject(error);
                    }
                    
                    // all good
                    return manager.onRecords(records, next);
                };
                
                return getListings()
                    .catch(retry)
                    .then(parse);
            };
            
            // check the current load state to see whether we can load or not
            return this.checkLoadState()
                // delay it to space out requests
                .then(delayPromise(delay * 1000))
                // then we can load
                .then(load);
        },
        /**
         * Checks load state.
         * @memberOf ListingManager
         * @returns {Promise} Resolve when done, reject on error.
         */
        checkLoadState: function() {
            const manager = this;
            // Verifies saved settings with current settings.
            const verifySettings = () => {
                // get the current session
                const session = manager.session;
                
                return manager.getSettings()
                    .then((settings) => {
                        // sessions do not match
                        const sessionChanged = Boolean(
                            // compare it with the most recently saved session
                            settings.session !== session
                        );
                        
                        if (sessionChanged) {
                            // ListingManager.load was called elsewhere
                            return Promise.reject('Load was called elsewhere');
                        }
                    });
            };
            // Verifies that the language settigns are configured.
            const verifyLanguage = () => {
                return new Promise((resolve, reject) => {
                    if (!manager.language) {
                        reject('No language');
                    } else {
                        resolve();
                    }
                });
            };
            // Verifies that more listings can be loaded.
            const verifyCanLoadMoreListings = () => {
                return new Promise((resolve, reject) => {
                    // starting point
                    const start = manager.nextLoadIndex();
                    // reached beginning of previous checked loop of listings collection
                    const isBeginning = Boolean(
                        manager.page > 0 &&
                        manager.settings.total_count &&
                        manager.settings.last_index &&
                        manager.calculateListingIndex(start) <= manager.settings.last_index
                    );
                    // reached end of count
                    const isEnd = Boolean(
                        manager.settings.total_count !== 0 &&
                        start >= manager.settings.total_count
                    );
                    
                    if (isBeginning) {
                        // reset settings
                        manager.reset()
                            .then(() => {
                                reject('Listings successfully updated!');
                            });
                    } else if (isEnd) {
                        // reset settings
                        manager.reset()
                            .then(() => {
                                reject('Listings fully laoded!');
                            });
                    } else {
                        resolve();
                    }
                });
            };
            
            return verifySettings()
                .then(verifyLanguage)
                .then(verifyCanLoadMoreListings);
        },
        /**
         * Parses response based on current state.
         * @memberOf ListingManager
         * @param {Object} response - Response object from Steam.
         * @returns {Object} Object containing parsing results.
         */
        parse: function(response) {
            const manager = this;
            const onParse = (error, fatal, records, difference) => {
                // not a fatal error
                const shouldRetry = Boolean(
                    error &&
                    !fatal
                );
                
                // get the page number
                const page = (Math.floor(difference / manager.pagesize) - 1);
                // minus 1 for current page
                const offset = page * manager.pagesize;
                // add on success
                const next = manager.nextLoadIndex(Math.max(offset, manager.pagesize));
                
                return {
                    records,
                    next,
                    error,
                    shouldRetry
                }; 
            };
            const currency = account.wallet.currency;
            // total count from settings
            const managerTotalCount = manager.settings.total_count;
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
                manager.settings.total_count = responseTotalCount;
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
                    difference >= manager.pagesize &&
                    manager.settings.current_index !== 0
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
            } = parseListings(response, manager.store, currency, manager.locales);
            
            if (dateStore) {
                // update date store
                manager.store.date = dateStore;
            }
            
            if (responseStart === 0) {
                // we don't want to shift difference when the start is 0
                difference = 0;
            }
            
            return onParse(error, fatal, records, difference);
        },
        /**
         * Adds records and updates settings on a successful response.
         * @memberOf ListingManager
         * @param {Listing[]} records - Array of records.
         * @param {Number} next - Next index to load.
         * @returns {Promise.<ListingManagerLoadResponse>} Resolves with response when done.
         */
        onRecords: function(records, next) {
            const manager = this;
            const updateSettings = () => {
                // update the settings from the newly collected records
                // and update the current index
                return manager.updateSettingsFromPage(records, next);
            };
            const getResult = () => {
                /**
                 * Load result.
                 * @typedef {Object} ListingManagerLoadResponse
                 * @property {Listing[]} records - Array of listings.
                 * @property {Object} progress - Load progress.
                 * @property {Number} progress.step = Current step.
                 * @property {Number} progress.total - Total steps.
                 */
                return {
                    records,
                    progress: {
                        step: manager.page,
                        total: manager.totalPages()
                    }
                };
            };
            
            return manager.addRecords(records)
                .then(updateSettings)
                .then(getResult);
        },
        /**
         * Adds records.
         * @memberOf ListingManager
         * @param {Listing[]} records - Array of records.
         * @returns {Promise} Resolve when done.
         */
        addRecords: function(records) {
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
                    resolve();
                }
            });
        },
        /**
         * Updates settings after getting a page of new records.
         * @memberOf ListingManager
         * @param {Listing[]} records - Array of records.
         * @param {Number} currentIndex - The current index to fetch at.
         * @returns {Promise.<ListingManagerLoadResponse>} Resolve when done.
         */
        updateSettingsFromPage: function(records, currentIndex) {
            const manager = this;
            const hasRecords = Boolean(
                records &&
                records.length > 0
            );
            
            manager.settings.current_index = currentIndex;
            // add a page
            manager.page += 1;
            
            if (hasRecords) {
                manager.store.last_fetched = records[records.length - 1];
                manager.settings.last_fetched_index = manager.store.last_fetched.index;
            }
            
            return ListingDB.listings.count()
                .then((count) => {
                    manager.settings.date = new Date();
                    manager.settings.recorded_count = count;
                    
                    return manager.saveSettings();
                });
        },
        /**
         * Fetch market transaction history result page.
         * @memberOf ListingManager
         * @param {Number} start - Index of listings to load from.
         * @param {Number} count - Number of listings to load per page.
         * @param {String} language - Language to load.
         * @returns {Promise.<Object>} Response JSON from Steam on resolve, error with details on reject.
         */
        get: function(start, count, language) {
            return Steam.requests.get.listings({
                count,
                start,
                l: language
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        return Promise.reject(response.statusText);
                    }
                })
                .then((body) => {
                    if (body.success) {
                        return body;
                    } else {
                        return Promise.reject(body.error || body.message || 'Response failed');
                    }
                });
        },
        /**
         * Gets the next starting index to load from.
         * @memberOf ListingManager
         * @param {Number} index - Index to calculate for.
         * @returns {Number} Starting index to use.
         */
        nextLoadIndex: function(index = 0) {
            const currentIndex = this.settings.current_index;
            
            return currentIndex + index;
        },
        /**
         * Calculates the index in reverse.
         *
         * E.g. The most recent listing would have an index of "1".
         * @memberOf ListingManager
         * @param {Number} index - Index to calculate for.
         * @returns {Number} Index.
         */
        calculateListingIndex: function(index = 0) {
            const totalCount = this.settings.total_count;
            // reverse index
            // listings are fetched from newest to oldest
            // but are indexed from oldest to newest (1 being the oldest)
            return totalCount - index;  
        },
        /**
         * Gets total number of page loads needed based on current state.
         * @memberOf ListingManager
         * @returns {Number} Total number of pages to collect based on current state.
         */
        totalPages: function() {
            // get the index we started loading at
            const startIndex = this.calculateListingIndex(this.start_index);
            // get the number between the starting index and the starting point from the last load session
            // refer to ListingManager.settings.last_index
            const countToPreviousStart = (
                // check that the setting exists
                this.settings.last_index &&
                // the offset
                startIndex - this.settings.last_index
            );
            // get the difference between the total count and the starting index
            const countToEndIndex = this.settings.total_count - this.start_index;
            // select the number of results we need to fetch in order to reach the end
            const numberOfResultsNeeded = this.settings.last_index ? countToPreviousStart : countToEndIndex;
            
            // calculate the number of pages needed
            return Math.max(1, Math.ceil(numberOfResultsNeeded / this.pagesize));
        }
    });
}

export {createListingManager};