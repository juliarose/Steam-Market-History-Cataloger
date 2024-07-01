import { readyState } from '../../app/readyState.js';
import * as Layout from '../../app/layout/index.js';
import { Listing } from '../../app/classes/Listing.js';
import { getPreferences } from '../../app/preferences.js';

const page = {
    query: document.getElementById('query'),
    results: document.getElementById('results')
};

async function onApp(app) {
    // builds the table to show the listings loaded
    function buildTable(records, collection) {
        const options = Object.assign({}, Layout.getLayoutOptions({
            account,
            preferences
        }), {
            table,
            collection
        });
        const tableEl = Layout.buildTable(records || [], Listing, options);
        
        Layout.render(page.results, tableEl);
    }
    
    function onRecords(records, collection) {
        buildTable(records, collection);
    }
    
    // builds the index for filters
    async function buildIndex(records) {
        const options = Object.assign({}, Layout.getLayoutOptions({
            account,
            preferences
        }), {
            limit,
            onChange: onRecords
        });
        const indexEl = await Layout.listings.buildFilters(table, records, Listing, options);
        
        page.query.appendChild(indexEl);
    }
    
    const { account, ListingDB } = app;
    const preferences = await getPreferences();
    const limit = preferences.search_results_count || 1000;
    const table = ListingDB.listings;
    const collection = table.orderBy('index').reverse();
    const records = await collection.clone().limit(limit).toArray();
    
    await buildIndex(records);
    onRecords(records, collection);
    Layout.ready();
}

// ready
{
    readyState(onApp, Layout.error);
}
