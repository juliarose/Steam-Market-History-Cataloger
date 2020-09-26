'use strict';

import { Steam } from './steam.js';

/**
 * Verifies that we are logged in.
 * @returns {Promise} Resolve when done, reject if we are not logged in or there is an error.
 */
export async function verifyLogin() {
    const response = await Steam.requests.get.marketHome();
        
    if (!response.ok) {
        return Promise.reject(response.statusText);
    }
    
    const responseText = await response.text();
    const isLoggedIn = /g_bLoggedIn = true;/.test(responseText);
    
    if (isLoggedIn) {
        // everything is alright
        return;
    }
    
    // and reject with an error that we are not logged in
    return Promise.reject('Not logged in');
}