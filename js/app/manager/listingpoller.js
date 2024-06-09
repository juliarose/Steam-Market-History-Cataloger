'use strict';

import { buildApp } from '../app.js';
import { verifyLogin } from '../steam/index.js';
import { ListingManager } from './listingsmanager.js';
import { EventEmitter } from '../../lib/eventemitter.js';
import { setLoadState } from '../layout/loadstate.js';
import { getPreferences } from '../preferences.js';

/**
 * Current listing count.
 * @event ListingPoller#count
 * @type {number}
 */

/**
 * Used for polling listings.
 * 
 * @fires ListingPoller#count
 */
export class ListingPoller extends EventEmitter {
    /**
     * The total number of listings collected by the poller.
     * @type {number}
     * @private
     */
    #listingCount = 0;
    /**
     * Whether the poller has been started or not.
     * @type {boolean}
     * @private
     */
    #started = false;
    /**
     * Whether we are currently loading or not.
     * @type {boolean}
     * @private
     */
    #isLoading = false;
    /**
     * The timer to get more after a set time. This can be cleared if we want to load immediately 
     * at a given point.
     * @type {(Object | null)}
     * @private
     */
    #timer = null;
    
    constructor() {
        super();
    }
    
    async #getPollInterval() {
        const preferences = await getPreferences();
        
        return preferences.background_poll_interval_minutes;
    }
    
    async #shouldLoad(force) {
        const preferences = await getPreferences();
        // should we load?
        const canLoad = Boolean(
            force ||
            preferences.background_poll_boolean
        );
            
        return Boolean(
            canLoad &&
            // not already loading
            !this.#isLoading
        );
    }
    
    /**
     * Loads listings.
     * @param {ListingManager} listingManager - The listing manager to load listings with.
     * @returns {Promise<void>} Resolves when done.
     */
    async #load(listingManager) {
        // we're done
        const done = async () => {
            if (this.#isLoading) {
                this.#updateLoadState(false);
                this.#sendCountMessage();
            } else {
                this.clearListingCount();
            }
            
            this.#getMoreAfter(await this.#getPollInterval());
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
    
    async #startLoading() {
        await verifyLogin();
        // will return app to create listing manager
        const app = await buildApp();
        // creates the listing manager
        const listingManager = new ListingManager(app);
        // then passes the manager to the load function to load listings
        this.#load(listingManager);
    }
    
    // sends count message if enabled in preferences
    async #sendCountMessage() {
        const preferences = await getPreferences();
        
        if (preferences.show_new_listing_count) {
            this.emit('count', this.#listingCount);
        }
    }
    
    /**
     * Checks the current state of the application then loads if everything is OK.
     * @returns {Promise<void>} Resolves when done.
     */
    async #checkStateThenLoad() {
        // clear timer if we are currently waiting
        clearTimeout(this.#timer);
        
        const should = await this.#shouldLoad();
        
        if (should) {
            this.#startLoading()
                .catch(() => {
                    // re-check in 5 minutes
                    this.#getMoreAfter(5);
                });
        } else {
            // re-check in 5 minutes
            this.#getMoreAfter(5);
        }
    }
    
    /**
     * Gets more listings after a set time.
     * @param {number} minutes - The number of minutes to wait.
     * @private
     */
    #getMoreAfter(minutes) {
        clearTimeout(this.#timer);
        this.#timer = setTimeout(this.#checkStateThenLoad.bind(this), minutes * 60 * 1000);
    }
    
    #updateLoadState(loading) {
        this.#isLoading = loading;
        setLoadState(loading);
    }
    
    /**
     * Resumes loading listings.
     * @param {boolean} [force=false] - Whether to force loading.
     * @returns {Promise<void>} Resolves when done.
     */
    async resumeLoading(force = false) {
        const canLoad = await this.#shouldLoad(force);
        
        if (canLoad) {
            this.#checkStateThenLoad();
        }
    }
    
    /**
     * Clears the listing count.
     */
    clearListingCount() {
        this.#listingCount = 0;
    }
    
    /**
     * Starts polling.
     *
     * This should only be called once.
     * @param {number} [minutes=5] - Number of minutes to wait for first load.
     */
    start(minutes = 5) {
        if (this.#started) {
            // once started we cannot call this again
            return;
        }
        
        this.#started = true;
        this.#getMoreAfter(minutes);
    }
}