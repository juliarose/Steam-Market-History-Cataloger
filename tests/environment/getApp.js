import { createListingDatabase } from '../../js/app/db/listing.js';
import { createAccountDatabase } from '../../js/app/db/account.js';
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
    const AccountDB = createAccountDatabase();
    const ListingDB = createListingDatabase(account.steamid);
    
    return {
        account,
        AccountDB,
        ListingDB
    };
}

module.exports = getApp;