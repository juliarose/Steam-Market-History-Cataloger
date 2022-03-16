'use strict';

import { createLocalStorageManager } from './storage/local.js';

/**
 * Creates a PreferencesManager.
 * @returns {Promise.<PreferencesManager>} A new PreferencesManager.
 */
export async function createPreferencesManager() {
    /**
     * Extension preferences manager.
     * @class PreferencesManager
     * @type {Manager}
     * @property {string} settings_name - Key for storing data.
     */
    const preferences = createLocalStorageManager({
        settings_name: 'preferences',
        /**
         * @namespace preferences.settings
         * @memberOf preferences
         */
        settings: {
            market_per_page: 100,
            market_poll_interval_seconds: 5,
            background_poll_boolean: true,
            background_poll_interval_minutes: 60,
            show_new_listing_count: true,
            pagination_count: 20,
            search_results_count: 1000
        }
    });
    
    // Configures the module.
    await (async function() {
        await preferences.getAndMergeSettings();
    }());
    
    return preferences;
}