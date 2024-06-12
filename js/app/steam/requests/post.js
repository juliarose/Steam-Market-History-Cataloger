import { queryString, omitEmpty } from '../../helpers/utils.js';
import { getXHR } from './helpers/getXHR.js';

/* Example response:
{
    "html": "<Very large HTML string...>"
    "cursor": {
        "wallet_txnid": "19029764231",
        "timestamp_newest": 1509869782,
        "balance": "37140",
        "currency": 1
    }
}
*/

/**
 * Gets page of purchase history.
 * @param {Object} options - Form data.
 * @param {string} options.sessionid - Session ID.
 * @param {Object} [options.cursor] - Cursor object from Steam.
 * @param {string} [options.l] - Language.
 * @returns {Promise} Fetch promise.
 */
export async function getPurchaseHistory(options) {
    const query = queryString(omitEmpty(options));
    const uri = 'https://store.steampowered.com/account/AjaxLoadMoreHistory';
    const params = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': query.length
        },
        credentials: 'include',
        mode: 'cors',
        referrer: 'no-referrer',
        body: query
    };
    
    return getXHR(uri, params);
}
