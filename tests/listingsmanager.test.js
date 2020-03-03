import { createListingManager } from '../js/app/manager/listingsmanager.js';
const getApp = require('./environment/getApp');
const steamid = '10000000000000000';

let listingManager;

beforeAll(async () => {
    const app = await getApp(steamid);
    
    listingManager = createListingManager(app);
    
    await listingManager.setup();
    
    return;
});

it('Listing manager is setup properly', () => {
    expect(listingManager.language).toBeDefined();
});