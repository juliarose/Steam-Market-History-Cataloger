'use strict';

import { loadAccount } from './account.js';
import { createListingDatabase } from './db/listing.js';
import { createAccountDatabase } from './db/account.js';
import { applist } from './data/applist.js';

/**
 * @typedef {import('./account.js').Account} Account
 */

/**
 * App.
 * @typedef {Object} App
 * @property {Account} account - Account manager.
 * @property {Object} AccountDB - The Dexie database object for the account data.
 * @property {Object} ListingDB - The Dexie database object for the listing data.
 */

/**
 * Builds the app object.
 * @returns {Promise<App>} Resolves with app.
 */
export async function buildApp() {
    const account = await loadAccount();
    
    // load json data
    await applist.get();
    
    // create the account db
    const AccountDB = createAccountDatabase();
    // create the listing db
    const ListingDB = createListingDatabase(account.steamid);
    
    // all together now...
    return {
        account,
        AccountDB,
        ListingDB
    };
}
