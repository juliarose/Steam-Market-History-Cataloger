'use strict';

import {Steam} from './steam.js';

/**
 * Verifies that we are logged in.
 * @returns {Promise} Resolve when done, reject if we are not logged in or there is an error.
 */
function verifyLogin() {
    return Steam.requests.get.marketHome()
        .then((response) => {
            if (response.ok) {
                return response.text();
            } else {
                return Promise.reject(response.statusText || 'Bad response');
            }
        })
        .then((text) => {
            let isLoggedIn = /g_bLoggedIn = true;/.test(text);
            
            if (isLoggedIn) {
                return;
            } else {
                return this.deleteSettings().
                    then(() => {
                        return Promise.reject('Not logged in');
                    });
            }
        });
}

export {verifyLogin};