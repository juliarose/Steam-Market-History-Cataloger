'use strict';

import {App} from '../app/app.js';
import {Layout} from '../app/layout/layout.js';
import {Listing} from '../app/classes/listing.js';
import {createListingManager} from '../app/manager/listingsmanager.js';
import {sendMessage} from '../app/browser.js';

const page = {
    results: document.getElementById('results'),
    progress: document.getElementById('load-progress'),
    progressBar: document.getElementById('load-progress').firstElementChild,
    loadDisplay: document.getElementById('load-display'),
    buttons: {
        getHistory: document.getElementById('get-history')
    },
    counts: {
        listingCount: document.getElementById('listing-count').querySelector('.value')
    }
};

function onReady() {
    App.ready()
        .then(onApp)
        .catch(Layout.error);
}

function onApp(app) {
    function render() {
        const updateListingsPromise = updateCount();
        // database table
        const table = app.ListingDB.listings;
        // create table with x newest listings
        const loadListingsPromise = table.orderBy('index').limit(10).reverse().toArray()
            .then((records) => {
                renderTable(records);
            });
        
        return Promise.all([
            updateListingsPromise,
            loadListingsPromise
        ]);
    }
    
    /**
     * Updates count of listings.
     * @returns {Promise} Resolve when done.
     */
    function updateCount() {
        // get total number of listings in db
        return app.ListingDB.listings.count()
            .then((count) => {
                page.counts.listingCount.textContent = count;
            });
    }
    
    /**
     * Renders table of listings.
     * @param {Array} records - Array of listings.
     * @returns {undefined}
     */
    function renderTable(records) {
        const options = Object.assign({}, Layout.getLayoutOptions(app), {
            keep_page: true,
            no_download: true
        });
        const tableEl = Layout.buildTable(records || [], Listing, options);
        
        Layout.render(page.results, tableEl);
    }
    
    function onRecords(records) {
        total = total.concat(records);
        updateCount();
        renderTable(total);
    }
    
    function showProgress(percent) {
        Velocity(page.progressBar, {
            width: percent + '%'
        }, {
            duration: 400
        });
    }
    
    // Starting loading listings
    function load() {
        function done(error) {
            page.progress.style.visibility = 'hidden';
            
            if (error) {
                Layout.alert(error, page.results);
            } else {
                Layout.alert(error || 'All done!', page.results);
            }
        }
        
        function loadListings() {
            // we've received a response and now want to get more
            function getMore({records, progress}) {
                const {step, total} = progress;
                const percent = Math.round((step / total) * 10000) / 100;
                
                showProgress(percent);
                onRecords(records);
                
                // call the load function again
                loadListings();
            }
            
            listingManager.load()
                .then(getMore)
                .catch(done);
        }
        
        listingManager.setup()
            .then(loadListings);
    }
    
    // Send a message to resume loading to the background script
    function sendResumeLoadingMessage() {
        sendMessage({
            name: 'resumeLoading'
        });
    }
    
    function addListeners() {
        window.onunload = () => {
            if (listingManager.isLoading) {
                // if the page is closed while loading is in progress,
                // continue loading in background
                sendResumeLoadingMessage();
            }
        };
        
        page.buttons.getHistory.addEventListener('click', (e) => {
            e.target.parentNode.remove();
            load();
        });
    }
    
    // array that will hold all of our collected records from loading
    let total = [];
    const listingManager = createListingManager(app);
    
    addListeners();
    render().then(Layout.ready);
}

onReady();