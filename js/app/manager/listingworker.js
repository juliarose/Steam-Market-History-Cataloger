'use strict';

// This is intended for use within the background service worker script.

import { buildApp } from '../app.js';
import { verifyLogin } from '../steam/index.js';
import { ListingManager } from './listingsmanager.js';
import { EventEmitter } from '../../lib/eventemitter.js';
import { setLoadState } from '../layout/loadstate.js';
import { getPreferences } from '../preferences.js';

/**
 * Current listing count.
 * @event ListingWorker#count
 * @type {number}
 */

/**
 * Used for polling listings.
 * 
 * @fires ListingWorker#count
 */
export class ListingWorker extends EventEmitter {
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
        super();
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
     * @returns {Promise<void>} Resolves when done.
     */
    async #load() {
        await verifyLogin();
        // will return app to create listing manager
        const app = await buildApp();
        // creates the listing manager
        const listingManager = new ListingManager(app);
        // we're done
        const done = async () => {
            if (this.#isLoading) {
                this.#updateLoadState(false);
                this.#sendCountMessage();
            } else {
                this.clearListingCount();
            }
            
            this.emit('complete');
        };
        const loadListings = () => {
            // we've received a response and now want to get more
            function getMore({ records }) {
                this.#listingCount += records.length;
                
                // call the load function again
                loadListings();
            }
            
            listingManager.load().then(getMore).catch(done);
        };
        
        this.#updateLoadState(true);
        return listingManager.setup().then(loadListings).catch(done);
    }
    
    /** 
     * Sends count message if enabled in preferences.
     * @returns {Promise<void>} Resolves when done.
     * @private
     */
    async #sendCountMessage() {
        const preferences = await getPreferences();
        
        if (preferences.show_new_listing_count) {
            this.emit('count', this.#listingCount);
        }
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
            return Promise.reject(new AppError('Already loading listings.'));
        }
        
        const preferences = await getPreferences();
        
        if (!force && !preferences.background_poll_boolean) {
            return Promise.reject(new AppError('Background polling is disabled.'));
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
