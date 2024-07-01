import { readyState } from '../app/readyState.js';
import * as Layout from '../app/layout/index.js';
import { Listing } from '../app/classes/Listing.js';
import { ListingManager } from '../app/manager/listingsmanager.js';
import { sendMessage } from '../app/browser.js';
import { getPreferences } from '../app/preferences.js';

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

async function onApp(app) {
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
        const options = Object.assign({}, Layout.getLayoutOptions({
            account,
            preferences,
        }), {
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
        let hasAlerted = false;
        
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
            
            // make sure this is only called once...
            if (!hasAlerted) {
                Layout.alert(
                    'Loading started! Loading will resume in background if you close this page at any point.',
                    page.results,
                    'active'
                );
                hasAlerted = true;
            }
            
            listingManager.load(0, now).then(getMore).catch(done);
        }
        
        listingManager.setup().then(() => {
            isLoading = true;
            loadListings(true);
        });
    }
    
    function addListeners() {
        window.addEventListener('beforeunload', () => {
            // if the page is closed while loading is in progress
            if (isLoading) {
                // continue loading in background
                sendMessage({
                    name: 'resumeLoading'
                });
            }
        });
        
        page.buttons.getHistory.addEventListener('click', (e) => {
            e.target.parentNode.remove();
            load();
        });
    }
    
    // array that will hold all of our collected records from loading
    let total = [];
    let isLoading;
    const listingManager = new ListingManager(app);
    const { account } = app;
    const preferences = await getPreferences();
    
    addListeners();
    render().then(Layout.ready);
}

// ready
{
    readyState(onApp, Layout.error);
}
