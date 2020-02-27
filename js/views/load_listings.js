'use strict';

import { buildApp } from '../app/app.js';
import { Layout } from '../app/layout/layout.js';
import { Listing } from '../app/classes/listing.js';
import { createListingManager } from '../app/manager/listingsmanager.js';
import { sendMessage } from '../app/browser.js';

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

async function onReady() {
    try {
        onApp(await buildApp());
    } catch (error) {
        Layout.error(error);
    }
}

function onApp(app) {
    async function render() {
        await updateCount();
        // database table
        const table = app.ListingDB.listings;
        // create table with x newest listings
        const mostRecentListings = await table.orderBy('index').limit(10).reverse().toArray();
        
        renderTable(mostRecentListings);
        
        return;
    }
    
    // Updates count of listings.
    async function updateCount() {
        // get total number of listings in db
        const count = await app.ListingDB.listings.count();
        
        page.counts.listingCount.textContent = count;
    }
    
    // Renders table of listings.
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
        function loadListings(now) {
            function done(error) {
                isLoading = false;
                page.progress.style.visibility = 'hidden';
                
                Layout.alert(error || 'All done!', page.results);
            }
            
            // we've received a response and now want to get more
            function getMore({ records, progress }) {
                const { step, total } = progress;
                const percent = Math.round((step / total) * 10000) / 100;
                
                showProgress(percent);
                onRecords(records);
                
                // call the load function again
                loadListings();
            }
            
            listingManager.load(0, now).then(getMore).catch(done);
        }
        
        listingManager.setup().then(() => {
            isLoading = true;
            loadListings(true);
        });
    }
    
    
    // Send a message to resume loading to the background script
    function sendResumeLoadingMessage() {
        alert('Loading will resume in background');
        sendMessage({
            name: 'resumeLoading'
        });
    }
    
    function addListeners() {
        window.onunload = () => {
            // if the page is closed while loading is in progress
            if (isLoading) {
                // continue loading in background
                // not in use currently to keep things simple
                // sendResumeLoadingMessage();
            }
        };
        
        page.buttons.getHistory.addEventListener('click', (e) => {
            e.target.parentNode.remove();
            load();
        });
    }
    
    // array that will hold all of our collected records from loading
    let total = [];
    let isLoading;
    const listingManager = createListingManager(app);
    
    addListeners();
    render().then(Layout.ready);
}

onReady();