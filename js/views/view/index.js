'use strict';

import { readyState } from '../../app/readyState.js';
import { Layout } from '../../app/layout/layout.js';
import { Listing } from '../../app/classes/listing.js';
import { getUrlParam } from '../../app/helpers/utils.js';

const page = {
    query: document.getElementById('query'),
    results: document.getElementById('results')
};
const query = {
    last: getUrlParam('last')
};
let queryDays;

async function onApp(app) {
    // builds the table to show the listings loaded
    function buildTable(records, collection) {
        const options = Object.assign({}, Layout.getLayoutOptions(app), {
            table,
            collection,
            limit,
            filterEl: page.query
        });
        const tableEl = Layout.buildTable(records || [], Listing, options);
        
        Layout.render(page.results, tableEl);
    }
    
    function onRecords(records, collection, opts = {}) {
        buildTable(records, collection, opts);
    }
    
    const { preferences, ListingDB } = app;
    const limit = preferences.settings.search_results_count || 1000;
    const table = ListingDB.listings;
    const collection = table.orderBy('index').reverse();
    const records = await collection.clone().limit(limit).toArray();
    
    onRecords(records, collection);
    Layout.ready();
}

// ready
readyState(onApp, Layout.error);