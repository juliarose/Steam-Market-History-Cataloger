import { readyState } from '../../app/readyState.js';
import * as Layout from '../../app/layout/index.js';
import { Listing } from '../../app/classes/listing.js';
import { getPreferences } from '../../app/preferences.js';

const page = {
    results: document.getElementById('results')
};

    
async function map(collection, mapperFn) {
    const result = [];
    
    return collection
        .each((row) => {
            result.push(mapperFn(row));
        })
        .then(() => {
            return result;
        });
}

async function onApp(app) {
    function buildSummaries(records) {
        const options = Object.assign({}, Layout.getLayoutOptions({
            account,
            preferences
        }), {
            count: 1e3
        });
        const tablesEl = Layout.listings.buildSummaries(records || [], Listing, options);
        
        Layout.render(page.results, tablesEl);
    }
    
    function onRecords(records) {
        buildSummaries(records);
    }
    
    const collection = app.ListingDB.listings;
    // we want to pick only certain keys to save memory
    // this can be improved by iterating over each record to add to the totals displayed
    // source - https://github.com/dfahlander/Dexie.js/issues/468#issuecomment-276961594
    let records = await map(collection, (record) => {
        return {
            is_credit: record.is_credit,
            index: record.index,
            appid: record.appid,
            date_acted: record.date_acted,
            price: record.price
        };
    });
    const { account } = app;
    const preferences = await getPreferences();
    
    records = records.sort((a, b) => b.index - a.index);
    onRecords(records);
    Layout.ready();
}

// ready
{
    readyState(onApp, Layout.error);
}
