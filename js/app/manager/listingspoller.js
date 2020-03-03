'use strict';

import { buildApp } from '../app.js';
import { verifyLogin } from '../steam/verifyLogin.js';
import { createListingManager } from '../manager/listingsmanager.js';
import { EventEmitter } from '../../lib/eventemitter.js';
import { setLoadState } from '../layout/loadstate.js';
import { createPreferencesManager } from '../manager/preferences.js';

/**
 * Creates a listing poller.
 * @param {Object} App - The app for configuring the poller.
 * @returns {ListingPoller} New listing poller.
 */
function createListingPoller() {
    function updateLoadState(loading) {
        isLoading = loading;
        setLoadState(loading);    
    }
    
    async function getPollInterval() {
        const settings = await preferences.getSettings(true);
        
        return settings.background_poll_interval_minutes;
    }
    
    async function shouldLoad(force) {
        const settings = await preferences.getSettings(true);
        // should we load?
        const canLoad = Boolean(
            force ||
            settings.background_poll_boolean
        );
            
        return Boolean(
            canLoad &&
            // not already loading
            !isLoading
        );
    }
    
    function load(listingManager) {
        // we're done
        async function done() {
            if (isLoading) {
                updateLoadState(false);
                listingCount += currentCount;
                preferences.getSettings(true)
                    .then((settings) => {
                        if (settings.show_new_listing_count) {
                            poller.emit('count', listingCount);
                        }
                    });
            } else {
                clearListingCount();
            }
            
            getMoreAfter(await getPollInterval());
        }
        
        function loadListings() {
            // we've received a response and now want to get more
            function getMore({ records }) {
                currentCount += records.length;
                
                // call the load function again
                loadListings();
            }
            
            listingManager.load().then(getMore).catch(done);
        }
        
        updateLoadState(true);
        listingManager.setup().then(loadListings).catch(done);
    }
    
    async function startLoading() {
        await verifyLogin();
        // will return app to create listing manager
        const app = await buildApp();
        // creates the listing manager
        const listingManager = createListingManager(app);
        // then passes the manager to the load function to load listings
        load(listingManager);
    }
    
    function getMoreAfter(minutes) {
        timer = setTimeout(checkStateThenLoad, minutes * 60 * 1000);
    }
    
    async function resumeLoading(force) {
        const canLoad = await shouldLoad(force);
        
        if (canLoad) {
            checkStateThenLoad();
        }
    }
    
    /**
     * Checks the current state of the application then loads if everything is OK.
     * @memberOf ListingPoller
     * @returns {Promise} Resolve when done.
     */
    async function checkStateThenLoad() {
        // clear timer if we are currently waiting
        clearTimeout(timer);
        const should = await shouldLoad();
        
        if (should) {
            startLoading()
                .then(() => {
                    currentCount = 0;
                })
                .catch(() => {
                    // re-check in 5 minutes
                    getMoreAfter(5);
                });
        } else {
            // re-check in 5 minutes
            getMoreAfter(5);
        }
    }
    
    /**
     * Clears the listing count.
     * @memberOf ListingPoller
     * @returns {undefined}
     */
    function clearListingCount() {
        listingCount = 0;
    }
    
    /**
     * Starts polling.
     *
     * This should only be called once.
     * @memberOf ListingPoller
     * @param {number} [minutes=5] - Number of minutes to wait for first load.
     * @returns {undefined}
     */
    function start(minutes = 5) {
        if (started) {
            // once started we cannot call this again
            return;
        }
        
        started = true;
        getMoreAfter(minutes);
    }
    
    // the total number of listings collected
    let listingCount = 0;
    // the total number of listings collected in the current loop
    let currentCount = 0;
    // whether the poller has been started or not
    let started = false;
    // whether we are currently loading or not
    let isLoading = false;
    // the timer to get more after a set time
    // can be cleared if we want to load immediately at a given point
    let timer;
    
    const preferences = createPreferencesManager();
    /**
     * Used for polling listings.
     * @class ListingPoller
     */
    const poller = Object.assign({}, EventEmitter.prototype,  {
        start,
        resumeLoading,
        clearListingCount
    });
    
    return poller;
}

export { createListingPoller };