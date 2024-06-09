import { ListingManager } from '../js/app/manager/listingsmanager.js';
const getApp = require('./environment/getApp');
const steamid = '10000000000000000';

let listingManager;

beforeAll(async () => {
    const app = await getApp(steamid);
    
    listingManager = new ListingManager(app);
    
    await listingManager.setup();
    
    return;
});

it('Listing manager is setup properly', () => {
    expect(typeof listingManager.setup).toBe('function');
});