'use strict';

import { queryString, omitEmpty } from '../../helpers/utils.js';
import { getXHR } from './helpers/getXHR.js';

/**
 * POST XHR requests for Steam.
 * 
 * @namespace Steam.requests.post
 * @memberOf Steam.requests
 */
const post = {
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
     * @memberOf Steam.requests.post
     * @param {Object} options - Form data.
     * @param {String} options.sessionid - Session ID.
     * @param {Object} [options.cursor] - Cursor object from Steam.
     * @param {String} [options.l] - Language.
     * @returns {Promise} Fetch promise.
     */
    purchasehistory: function(options) {
        let query = queryString(omitEmpty(options));
        let uri = 'https://store.steampowered.com/account/AjaxLoadMoreHistory';
        let params = {
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
};

export { post };