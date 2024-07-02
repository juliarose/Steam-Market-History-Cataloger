// @ts-check

// This is intended for use within the background service worker script.

import { buildApp } from '../app.js';
import { verifyLogin } from '../steam/index.js';
import { ListingManager } from '../manager/listingsmanager.js';
import { setLoadState } from '../layout/loadstate.js';
import { getPreferences } from '../preferences.js';
import { AppError, ERROR_TYPE } from '../error.js';
import { getWorkerState, addWorkerState, saveWorkerState } from '../workerState.js';

/**
 * Used for polling listings.
 */
export class ListingWorker {
    /**
     * Whether we are currently loading or not.
     * @type {boolean}
     */
    #isLoading = false;
    
    /**
     * Creates a new listing worker.
     */
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
     * @returns {Promise<void>} Resolves when done.
     */
    async clearListingCount() {
        return addWorkerState({
            listing_count: 0
        });
    }
    
    /**
     * Gets the listing count. This is the number of listings collected by the worker since the 
     * last clear.
     * 
     * This is stored in local storage since service workers are not meant for storing long-
     * running state.
     * @returns {Promise<number>} Resolves with the listing count.
     */
    async getListingCount() {
        const { listing_count } = await getWorkerState();
        
        return listing_count;
    }
    
    /**
     * Increments the listing count.
     * @param {number} count - Number to increment by. 
     * @returns {Promise<void>} Resolves when done.
     */
    async incrementListingCount(count) {
        const state = await getWorkerState();
        
        state.listing_count += count;
        return saveWorkerState(state);
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
            
            // return the current count
            return this.getListingCount();
        };
        // we've received a response and now want to get more
        const getMore = async ({ records }) => {
            await this.incrementListingCount(records.length);
            
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
        
        await this.#load();
    }
    
    /**
     * Sets the loading state.
     * @param {boolean} loading - Whether we are loading or not.
     */
    #updateLoadState(loading) {
        this.#isLoading = loading;
        setLoadState(loading);
    }
}
