// This is intended for use within the background service worker script.

import { buildApp } from '../app.js';
import { verifyLogin } from '../steam/index.js';
import { ListingManager } from './listingsmanager.js';
import { setLoadState } from '../layout/loadstate.js';
import { getPreferences } from '../preferences.js';
import { AppError, ERROR_TYPE } from '../error.js';

/**
 * Used for polling listings.
 */
export class ListingWorker {
    /**
     * The total number of listings collected by the poller.
     * @type {number}
     * @private
     */
    #listingCount = 0;
    /**
     * Whether we are currently loading or not.
     * @type {boolean}
     * @private
     */
    #isLoading = false;
    
    constructor() {
        
    }
    
    /**
     * Starts polling.
     * @param {boolean} [force=false] - Whether to force loading.
     */
    async start(force = false) {
        return this.#checkStateThenLoad(force);
    }
    
    /**
     * Gets whether we are currently loading or not.
     * @type {boolean}
     * @readonly
     * @public
     */
    get isLoading() {
        return this.#isLoading;
    }
    
    /**
     * Gets the current poll interval in minutes as defined in preferences.
     * @returns {Promise<number>} Resolves with the poll interval in minutes.
     */
    async getPollIntervalMinutes() {
        const preferences = await getPreferences();
        
        return preferences.background_poll_interval_minutes;
    }
    
    /**
     * Clears the listing count.
     */
    clearListingCount() {
        this.#listingCount = 0;
    }
    
    /**
     * Loads listings.
     * @returns {Promise<number>} Resolves with listing count when done.
     */
    async #load() {
        await verifyLogin();
        // will return app to create listing manager
        const app = await buildApp();
        // creates the listing manager
        const listingManager = new ListingManager(app);
        // we're done
        const loadListingsDone = async (error) => {
            if (this.#isLoading) {
                this.#updateLoadState(false);
            }
            
            if (error.name != ERROR_TYPE.APP_SUCCESS_ERROR) {
                console.warn('Error loading listings:', error.message);
                return Promise.reject(error);
            }
            
            const count = this.#listingCount;
            
            this.clearListingCount();
            
            return count;
        };
        // we've received a response and now want to get more
        const getMore = async ({ records }) => {
            this.#listingCount += records.length;
            
            // call the load function again
            return loadListings();
        };
        const loadListings = async () => {
            return listingManager.load()
                .then(getMore)
                .catch(loadListingsDone);
        };
        
        this.#updateLoadState(true);
        await listingManager.setup();
        
        return loadListings();
    }
    
    /**
     * Checks the current state of the application then loads if everything is OK.
     * @param {boolean} [force=false] - Whether to force loading.
     * @returns {Promise<void>} Resolves when done.
     * @private
     */
    async #checkStateThenLoad(force = false) {
        // already loading
        if (this.#isLoading) {
            throw new AppError('Already loading listings.');
        }
        
        const preferences = await getPreferences();
        
        if (!force && !preferences.background_poll_boolean) {
            throw new AppError('Background polling is disabled.');
        }
        
        return this.#load();
    }
    
    /**
     * Sets the loading state.
     * @param {boolean} loading - Whether we are loading or not.
     * @private
     */
    #updateLoadState(loading) {
        this.#isLoading = loading;
        setLoadState(loading);
    }
}
