'use strict';

import {createAccountManager} from './manager/account.js';
import {createPreferencesManager} from './manager/preferences.js';
import {loadData} from './initializers/data.js';
import {configureDB} from './initializers/db.js';
import {configureDB as configureAccountDB} from './initializers/accountdb.js';
import {configureDisplay} from './initializers/classes.js';

/**
 * App.
 *
 * @namespace App
 */
const App = {
    /**
     * Gets logins, extension preferences, account settings, language, and configures database.
     * @memberOf App
     * @returns {Promise} Resolve when done.
     */
    ready: function() {
        const setAccountDB = (db) => AccountDB = db;
        const setListingDB = (db) => ListingDB = db;
        const preferences = createPreferencesManager();
        const account = createAccountManager();
        let AccountDB;
        let ListingDB;
        
        return preferences.setup()
            .then(() => {
                // account must be loaded first
                return account.setup();
            })
            .then((data) => {
                // configure display based on loaded locales
                // from account
                configureDisplay(data.locales);
                
                return loadData();
            })
            // configure the account db
            .then(configureAccountDB)
            // once obtained, set the account db
            .then(setAccountDB)
            // configure the listing db
            .then(() => {
                return configureDB(account);
            })
            // once obtained, set the listing db
            .then(setListingDB)
            .then((db) => {
                ListingDB = db;
                
                return {
                    preferences,
                    account,
                    AccountDB,
                    ListingDB
                };
            });
    }
};

export {App};