import {createListingManager} from '../js/app/manager/listingsmanager.js';
const getApp = require('./environment/getApp');
const steamid = '10000000000000000';

let listingManager;

beforeAll(() => {
    return getApp(steamid)
        .then(createListingManager)
        .then((manager) => {
            listingManager = manager;
            
            return listingManager.setup();
        })
        .catch((error) => {
            console.log(error);
        });
});

it('Listing manager is setup properly', () => {
    expect(listingManager.language).toBeDefined();
});