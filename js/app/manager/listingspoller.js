'use strict';

import {verifyLogin} from '../steam/verifyLogin.js';
import {createListingManager} from '../manager/listingsmanager.js';
import {EventEmitter} from '../../lib/eventemitter.js';
import {setLoadState} from '../layout/loadstate.js';
import {createPreferencesManager} from '../manager/preferences.js';

/**
 * Creates a listing poller.
 * @param {Object} App - The app for configuring the poller.
 * @returns {ListingPoller} New listing poller.
 */
function createListingPoller(App) {
    function updateLoadState(loading) {
        isLoading = loading;
        setLoadState(loading);    
    }
    
    function getPollInterval() {
        return preferences.getSettings(true)
            .then((settings) => {
                const minutes = settings.background_poll_interval_minutes || 60;
    
                return minutes;
            });
    }
    
    function shouldLoad(force) {
        return preferences.getSettings(true)
            .then((settings) => {
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
            });
    }
    
    function load(listingManager) {
        // we're done
        function done() {
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
            
            getPollInterval()
                .then((minutes) => {
                    getMoreAfter(minutes);
                });
        }
        
        function loadListings() {
            // we've received a response and now want to get more
            function getMore({records}) {
                currentCount += records.length;
                
                // call the load function again
                loadListings();
            }
            
            listingManager.load()
                .then(getMore)
                .catch(done);
        }
        
        updateLoadState(true);
        listingManager.setup()
            .then(loadListings)
            .catch(done);
    }
    
    function startLoading() {
        return verifyLogin()
            // will return app to create listing manager
            .then(App.ready)
            // creates the listing manager
            .then(createListingManager)
            // then passes the manager to the load function to load listings
            .then(load);
    }
    
    function getMoreAfter(minutes) {
        timer = setTimeout(checkStateThenLoad, minutes * 60 * 1000);
    }
    
    function resumeLoading(force) {
        shouldLoad(force)
            .then((canLoad) => {
                if (canLoad) {
                    checkStateThenLoad();
                }
            });
    }
    
    /**
     * Checks the current state of the application then loads if everything is OK.
     * @memberOf ListingPoller
     * @returns {undefined}
     */
    function checkStateThenLoad() {
        // clear timer if we are currently waiting
        clearTimeout(timer);
        shouldLoad()
            .then((should) => {
                if (should) {
                    startLoading().then(() => {
                        currentCount = 0;
                    }).catch(() => {
                        // re-check in 5 minutes
                        getMoreAfter(5);
                    });
                } else {
                    // re-check in 5 minutes
                    getMoreAfter(5);
                }
            });
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
     * @param {Number} [minutes=5] - Number of minutes to wait for first load.
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

export {createListingPoller};