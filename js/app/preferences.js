import { LocalStorage } from './storage/local.js';

const PREFERENCES_SETTINGS_NAME = 'preferences';

/**
 * Used for loading and saving preferences.
 */
export const preferencesStorage = new LocalStorage(PREFERENCES_SETTINGS_NAME);

/**
 * @typedef {Object} Preferences
 * @property {number} market_per_page - Number of items per page.
 * @property {number} market_poll_interval_seconds - Poll interval in seconds.
 * @property {boolean} background_poll_boolean - Background poll boolean.
 * @property {number} background_poll_interval_minutes - Background poll interval in minutes.
 * @property {boolean} show_new_listing_count - Show new listing count.
 * @property {number} pagination_count - Pagination count.
 * @property {number} search_results_count - Search results count.
 */

/**
 * Gets preferences.
 * @returns {Promise<Preferences>} Preferences.
 */
export async function getPreferences() {
    const preferences = await preferencesStorage.getSettings() || {};
    
    return Object.assign({
        market_per_page: 100,
        market_poll_interval_seconds: 5,
        background_poll_boolean: true,
        background_poll_interval_minutes: 60,
        show_new_listing_count: true,
        pagination_count: 20,
        search_results_count: 1000
    }, preferences);
}

/**
 * Saves preferences.
 * @param {Preferences} preferences - Preferences to save.
 * @returns {Promise} Resolves when done.
 */
export async function savePreferences(preferences) {
    return preferencesStorage.saveSettings(preferences);
}

/**
 * Adds preferences to existing preferences.
 * @param {Object} preferences - Preferences to add.
 * @returns {Promise} Resolves when done.
 */
export async function addPreferences(preferences) {
    const currentPreferences = await getPreferences();
    // merge the preferences
    const mergedPreferences = Object.assign({}, currentPreferences, preferences);
    
    return savePreferences(mergedPreferences);
}
