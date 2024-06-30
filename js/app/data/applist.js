import { fetchJSON } from '../helpers/fetchjson.js'; 
import { getExtensionURL } from '../browser.js';

/**
 * Loads/stores app data.
 */
export const applist = {
    /**
     * Get app list from stored JSON file.
     * @param {Function} callback - Called when finished loading.
     * @returns {Promise<Object.<string, string>>} Resolves with applist when done, reject on error.
     */
    async get() {
        const uri = getExtensionURL('/json/applist.json');
        const json = await fetchJSON(uri);
        
        this.set(json);
        
        return json;
    },
    /**
     * Set app list.
     * @param {Object} apps - JSON object containing apps.
     */
    set(apps) {
        Object.assign(this, apps);
    }
};