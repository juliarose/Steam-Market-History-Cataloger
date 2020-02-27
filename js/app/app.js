'use strict';

import { createAccountManager } from './manager/account.js';
import { createPreferencesManager } from './manager/preferences.js';
import { loadData } from './initializers/data.js';
import { configureDB } from './initializers/db.js';
import { configureDB as configureAccountDB } from './initializers/accountdb.js';
import { configureDisplay } from './initializers/classes.js';

// prepares state and returns all state data
async function buildApp() {
    const preferences = createPreferencesManager();
    const account = createAccountManager();
    
    await preferences.setup();
    // account must be loaded first
    const data = await account.setup();
    // configure display based on loaded locales
    // from account
    configureDisplay(data.locales);
    // load json data
    await loadData();
    // configure the account db
    const AccountDB = await configureAccountDB();
    // configure the listing db
    const ListingDB = await configureDB(account);
    
    // all together now...
    return {
        preferences,
        account,
        AccountDB,
        ListingDB
    };
}

export { buildApp };