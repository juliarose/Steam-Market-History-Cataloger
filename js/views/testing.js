'use strict';

import {App} from '../app/app.js';
import {Layout} from '../app/layout/layout.js';
import {Listing} from '../app/classes/listing.js';
import {Steam} from '../app/steam/steam.js';

let page = {
    results: document.getElementById('results'),
    query: document.getElementById('query')
};

function onReady() {
    App.ready()
        .then(onApp)
        .catch(Layout.error);
}

function onApp(app) {
    function renderTable(records) {
        const options = Object.assign({
            keep_page: true,
            no_download: false
        }, Layout.getLayoutOptions(app));
        const tableEl = Layout.buildTable(records || [], Listing, options);
        
        Layout.render(page.results, tableEl);
    }
    
    function onRecords(records) {
        renderTable(records);
    }
    
    function buildIndex(records) {
        const options = Object.assign({}, Layout.getLayoutOptions(app), {
            onChange: onRecords
        });
        const indexEl = Layout.listings.buildFilters(records, Listing, options);
        
        page.query.appendChild(indexEl);
    }
    
    function render() {
        // database table
        const table = app.ListingDB.listings;
        
        // create table with x newest listings
        return table.orderBy('index').limit(1000).reverse().toArray()
            .then((records) => {
                buildIndex(records);
                renderTable(records);
            });
    }
    
    const date = app.account.locales.parseDateString('mar 23', 'en');
    console.log(date);
    
    /*
    Steam.requests.get.home().then((response) => {
        console.log(response);
        response.text().then((text) => {
            console.log(text);
        });
    }).catch((e) => {
        console.log(e);
    });
    */
    render().then(Layout.ready);
}

onReady();