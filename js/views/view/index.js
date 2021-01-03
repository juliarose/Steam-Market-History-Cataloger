'use strict';

import { readyState } from '../../app/readyState.js';
import { Layout } from '../../app/layout/layout.js';
import { Listing } from '../../app/classes/listing.js';
import { getUrlParam, isNumber, basicPlural } from '../../app/helpers/utils.js';

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
        const options = Object.assign({}, Layout.getLayoutOptions(app), {
            limit,
            onChange: onRecords
        });
        const indexEl = await Layout.listings.buildFilters(table, records, Listing, options);
        
        page.query.appendChild(indexEl);
    }
    
    const { preferences, ListingDB } = app;
    const limit = preferences.search_results_count || 1000;
    const table = ListingDB.listings;
    const collection = table.orderBy('index').reverse();
    const records = await table.orderBy('index').reverse().limit(limit).toArray();
    
    buildIndex(records);
    onRecords(records, collection);
    Layout.ready();
}

// ready
readyState(onApp, Layout.error);