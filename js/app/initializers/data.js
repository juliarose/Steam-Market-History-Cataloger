'use strict';

import {applist} from '../data/applist.js';

/**
 * Loads data for app.
 * @param {String} language - Name of language to load.
 * @returns {Promise} Resolve when done.
 */
function loadData() {
    let loadApps = applist.get();
    
    return Promise.all([
        loadApps
    ]);
}

export {loadData};