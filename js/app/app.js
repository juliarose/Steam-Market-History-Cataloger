'use strict';

import { createAccountManager } from './manager/account.js';
import { createPreferencesManager } from './manager/preferences.js';
import { createListingDatabase } from './db/listing.js';
import { createAccountDatabase } from './db/account.js';
import { applist } from './data/applist.js';

/**
 * Builds the app object.
 * @returns {Promise<App>} Resolves with app.
 */
export async function buildApp() {
    // "preferences" and "account" load settings from chrome's local storage
    // and manage the state of this data for use within the app
    const [
        preferences,
        account
    ] = await Promise.all([
        createPreferencesManager(),
        createAccountManager()
    ]);
    
    if (!account.steamid) {
        return Promise.reject('No SteamID present.');
    }
    
    // load json data
    await applist.get();
    
    // create the account db
    const AccountDB = createAccountDatabase();
    // create the listing db
    const ListingDB = createListingDatabase(account.steamid);
    
    // all together now...
    /**
     * App.
     * @typedef {Object} App
     * @property {PreferencesManager} preferences - Preferences manager.
     * @property {AccountManager} account - Account manager.
     * @property {Object} AccountDB - The Dexie database object for the account data.
     * @property {Object} ListingDB - The Dexie database object for the listing data.
     */
    return {
        preferences,
        account,
        AccountDB,
        ListingDB
    };
}