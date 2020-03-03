'use strict';

import { buildApp } from '../../app/app.js';
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

async function onReady() {
    try {
        onApp(await buildApp());
    } catch (error) {
        Layout.error(error);
    }
}

function onApp(app) {
    // builds the table to show the listings loaded
    function buildTable(records) {
        let title;
        
        if (queryDays !== undefined) {
            title = `Showing ${basicPlural('since yesterday', 'last ' + queryDays + ' days', queryDays)}`;
        }
        
        const options = Object.assign({}, Layout.getLayoutOptions(app), {
            title
        });
        const tableEl = Layout.buildTable(records || [], Listing, options);
        
        Layout.render(page.results, tableEl);
    }
    
    function onRecords(records) {
        buildTable(records);
    }
    
    // builds the index for filters
    function buildIndex(records) {
        const options = Object.assign({}, Layout.getLayoutOptions(app), {
            onChange: onRecords
        });
        const indexEl = Layout.listings.buildFilters(records, Listing, options);
        
        page.query.appendChild(indexEl);
    }
    
    let collection = app.ListingDB.listings;
    
    if (isNumber(query.last)) {
        const date = new Date();
        const days = parseInt(query.last);
        
        queryDays = days;
        date.setDate(date.getDate() - days);
        
        collection = collection.where('date_acted').above(date);
    }
    
    collection.toArray()
        .then((records) => {
            // this is faster than sorting in dexie
            records = records.sort((a, b) => b.index - a.index);
            buildIndex(records);
            onRecords(records);
            Layout.ready();
        });
}

onReady();