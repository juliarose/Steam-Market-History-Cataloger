import {configureDB as configureAccountDB} from '../../js/app/initializers/accountdb.js';
import {createPreferencesManager} from '../../js/app/manager/preferences.js';
import {configureDB} from '../../js/app/initializers/db.js';
import {getCurrency} from '../../js/app/currency.js';

const getLocales = require('./getLocales');

function getApp(steamid, language = 'english', currencyCode = 1) {
    const currency = getCurrency(currencyCode);
    const account = {
        steamid,
        language,
        wallet: {
            currency
        }
    };
    const preferences = createPreferencesManager();
    let locales;
    let AccountDB;
    let ListingDB;
    
    return getLocales()
        .then((result) => {
            locales = result;
            account.locales = locales;
            
            return account;
        })
        .then(configureAccountDB)
        .then((db) => {
            AccountDB = db;
            
            return configureDB(account);
        })
        .then((db) => {
            ListingDB = db;
            
            return {
                account,
                preferences,
                AccountDB,
                ListingDB
            };
        });
}

module.exports = getApp;