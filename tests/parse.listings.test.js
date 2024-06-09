import { parseListings } from '../js/app/parsers/parseListings.js';
import { getCurrency } from '../js/app/currency.js';

const path = require('path');
const fs = require('fs');
const getLocales = require('./environment/getLocales');

const getResponseJSON = (location) => {
    const responsePath = path.join(__dirname, location);
    const response = fs.readFileSync(responsePath, 'utf8');
    // the json contains 10 completed transactions
    const responseJSON = JSON.parse(response);
    
    return responseJSON;
};
const jsons = [
    '/fixtures/market/myhistory/response-1.json',
    '/fixtures/market/myhistory/response-2.json'
].map(getResponseJSON);
// USD
const currency = getCurrency(1);
const current = {
    date: {
        year: 2024,
        month: 6
    }
};
let locales;

beforeAll(async () => {
    locales = await getLocales();
    
    return;
});

it('Localizations are prepared', () => {
    expect(locales.months).toBeDefined();
});

it('DOM parser exists', () => {
    expect(DOMParser).toBeDefined();
});

it('Parses response data successfully', () => {
    const response = jsons[0];
    const {
        records
    } = parseListings(response, current, currency, locales);
    
    expect(records).toBeDefined();
});

// These are still useful, but they need to be reworked to use the new responses

// import { Listing } from '../js/app/classes/listing.js';
// const listings = JSON.parse(require('fs').readFileSync(__dirname + '/fixtures/listings.json', 'utf8')).items.map(withDate);
// const account = {};
// const createResponse = require('./helpers/createTestResponse');
// const withDate = (listing) => {
//     [
//         'date_acted',
//         'date_listed'
//     ].forEach((key) => {
//         listing[key] = new Date(listing[key]);
//     });
    
//     delete listing.icon;
    
//     return new Listing(listing);
// };

// it('Cuts off at last transaction id', () => {
//     const response = jsons[0];
//     const store = Object.assign({
//         last_fetched: {
//             transaction_id: '1933655612887727060-1933655612887727061'
//         }
//     }, current);
//     const {
//         records
//     } = parseListings(response, store, currency, locales);
    
//     expect(records.length).toBe(49);
// });

// it('Breaks at last indexed transaction id', () => {
//     const response = jsons[0];
//     const store = Object.assign({
//         last_indexed: {
//             transaction_id: '3106844045478361185-3106844045478361186'
//         }
//     }, current);
//     const {
//         records
//     } = parseListings(response, store, currency, locales);
    
//     expect(records.length).toBe(8);
// });

// it('Transitions year', () => {
//     const {
//         dateStore
//     } = parseListings(jsons[0], current, currency, locales);
//     const next = Object.assign({}, current, { date: dateStore });
//     const {
//         records
//     } = parseListings(jsons[1], next, currency, locales);
//     const record = records[0];
//     const date = record.date_acted;
//     const year = date.getFullYear();
    
//     expect(year).toBe(2018);
// });

// it('Creates a test response', () => {
//     const listing = listings[0];
//     const response = createResponse([listing], account);
    
//     expect(response).toBeDefined();
// });

// it('Parses a test response', () => {
//     const listing = listings[0];
//     const response = createResponse([listing], account, {
//         total_count: 374999,
//         start: 0
//     });
//     const store = current;
//     const {
//         records
//     } = parseListings(response, store, currency, locales);
//     const record = records[0];
    
//     expect(record).toEqual(listing);
// });

it('Parses the price correctly', () => {
    const response = jsons[0];
    const {
        records
    } = parseListings(response, current, currency, locales);
    const record = records[0];
    
    expect(record.price).toBe(10);
});