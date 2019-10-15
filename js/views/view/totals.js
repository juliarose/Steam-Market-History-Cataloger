'use strict';

import {App} from '../../app/app.js';
import {Layout} from '../../app/layout/layout.js';
import {Listing} from '../../app/classes/listing.js';

const page = {
    results: document.getElementById('results')
};

function onReady() {
    App.ready()
        .then(onApp)
        .catch(Layout.error);
}

function onApp(app) {
    function buildSummaries(records) {
        const options = Object.assign({}, Layout.getLayoutOptions(app), {
            count: 1e3
        });
        const tablesEl = Layout.listings.buildSummaries(records || [], Listing, options);
        
        Layout.render(page.results, tablesEl);
    }
    
    function onRecords(records) {
        buildSummaries(records);
    }
    
    app.ListingDB.listings.toArray()
        .then((records) => {
            // this is faster than sorting in dexie
            records = records.sort((a, b) => b.index - a.index);
            onRecords(records);
            Layout.ready();
        });
}

onReady();