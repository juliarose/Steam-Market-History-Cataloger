import { createListingDatabase } from '../../js/app/initializers/db.js';
import { createAccountDatabase } from '../../js/app/initializers/accountdb.js';
import { createPreferencesManager } from '../../js/app/manager/preferences.js';
import { configureDB } from '../../js/app/initializers/db.js';
import { getCurrency } from '../../js/app/currency.js';

const getLocales = require('./getLocales');

async function getApp(steamid, language = 'english', currencyCode = 1) {
    const currency = getCurrency(currencyCode);
    const locales = await getLocales(language);
    const account = {
        steamid,
        language,
        locales,
        wallet: {
            currency
        }
    };
    const preferences = createPreferencesManager();
    const AccountDB = createAccountDatabase();
    const ListingDB = createListingDatabase(account.steamid);
    
    return {
        account,
        preferences,
        AccountDB,
        ListingDB
    };
}

module.exports = getApp;