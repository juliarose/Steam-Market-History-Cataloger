'use strict';

import {createManager} from './helpers/createManager.js';

/**
 * Creates a PreferencesManager.
 * @returns {PreferencesManager} A new PreferencesManager.
 */
function createPreferencesManager() {
    /**
     * Extension preferences manager.
     * @class PreferencesManager
     * @type {Manager}
     * @property {String} settings_name - Key for storing data.
     */
    return createManager({
        settings_name: 'preferences',
        /**
         * @namespace preferences.settings
         * @memberOf preferences
         */
        settings: {
            market_per_page: 100,
            market_poll_interval_seconds: 5,
            background_poll_boolean: false,
            background_poll_interval_minutes: 60,
            show_new_listing_count: true,
            pagination_count: 100
        },
        /**
         * Configures the module.
         * @memberOf preferences
         * @returns {Promise} Resolve when done.
         */
        setup: function() {
            return this.getAndMergeSettings();
        }
    });
}

export {createPreferencesManager};