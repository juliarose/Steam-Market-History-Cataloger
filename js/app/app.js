'use strict';

import { createAccountManager } from './manager/account.js';
import { createPreferencesManager } from './manager/preferences.js';
import { loadData } from './initializers/data.js';
import { createListingDatabase } from './initializers/db.js';
import { createAccountDatabase } from './initializers/accountdb.js';

/**
 * Builds the app object.
 * @returns {Promise<App>} Resolves with app.
 */
export async function buildApp() {
    // "preferences" and "account" load settings from chrome's local storage
    // and manage the state of this data for use within the app
    const preferences = createPreferencesManager();
    const account = createAccountManager();
    
    await preferences.setup();
    await account.setup();
    
    if (!account.steamid) {
        return Promise.reject('No SteamID present.');
    }
    
    // load json data
    await loadData();
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