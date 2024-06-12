import { fetchJSON } from '../helpers/fetchjson.js'; 
import { getExtensionURL } from '../browser.js';

/**
 * Loads/stores app data.
 * 
 * @namespace applist
 */
export const applist = {
    /**
     * Get app list from stored JSON file.
     * @param {Function} callback - Called when finished loading.
     * @returns {Promise<Object>} Resolves with applist when done, reject on error.
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
     * @memberOf applist
     */
    set: function(apps) {
        Object.assign(this, apps);
    }
};