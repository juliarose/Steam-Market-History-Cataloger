'use strict';

import { fetchJSON } from '../helpers/fetchjson.js'; 
import { getExtensionURL } from '../browser.js';

/**
 * Loads/stores app data.
 * 
 * @namespace applist
 */
const applist = {
    /**
     * Get app list from stored JSON file.
     * @param {applist.get-callback} callback - Called when finished loading.
     * @returns {Promise.<Object>} Resolve with applist when done, reject on error.
     * @memberOf applist
     */
    get: async function() {
        const uri = getExtensionURL('/json/applist.json');
        const json = await fetchJSON(uri);
        
        this.set(json);
        
        return json;
    },
    /**
     * Set app list.
     * @param {Object} apps - JSON object containing apps.
     * @returns {undefined}
     * @memberOf applist
     */
    set: function(apps) {
        Object.assign(this, apps);
    }
};

export { applist };