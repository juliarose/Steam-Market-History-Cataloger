'use strict';

import { storage } from '../../../browser.js';

/**
 * This module acts as a mixin element for obtaining storage settings.
 * Set "settings_name" within the same scope to use as a key for getting/setting storage values.
 * @interface Settings
 * @namespace Settings
 */
const Settings = {
    /**
     * @namespace Settings.settings
     * @memberOf Settings
     */
    settings: {},
    /**
     * Gets the settings name.
     * @returns {String} Name for settings.
     * @memberOf Settings
     */
    settingsName: function() {
        return this.settings_name;
    },
    /**
     * Gets the settings.
     * @memberOf Settings
     * @param {Boolean} noWrapper - Get settings object without wrapper.
     * @returns {Promise.<Object>} Resolve with settings when done.
     */
    getSettings: function(noWrapper) {
        return new Promise((resolve) => {
            let name = this.settingsName();
            
            storage.get(name, (settings) => {
                if (noWrapper && settings) {
                    settings = settings[name];
                }
                
                resolve(settings || {});
            });
        });
    },
    /**
     * Saves the settings.
     * @memberOf Settings
     * @param {Object} [obj] - Object to save, defaults to 'this.settings' if not given.
     * @returns {Promise} Resolve when done.
     */
    saveSettings: function(obj) {
        return new Promise((resolve) => {
            const name = this.settingsName();
            let stored = {};
            
            stored[name] = obj || this.settings;
            storage.set(stored, resolve);
        });
    },
    /**
     * @memberOf Settings
     * Deletes the settings.
     * @returns {Promise} Resolve when done.
     */
    deleteSettings: function() {
        this.settings = {};
        
        return this.saveSettings({});
    },
    /**
     * @memberOf Settings
     * Merges the settings with the current settings.
     * @param {Object} obj - Object to merge.
     * @returns {undefined}
     */
    mergeSettings: function(obj) {
        const name = this.settingsName();
        
        this.settings = Object.assign(this.settings, obj[name]);
    },
    /**
     * Get and merge with current settings.
     * @memberOf Settings
     * @param {Boolean} noWrapper - Get settings object without wrapper.
     * @returns {Promise.<Object>} Resolve with settings when done.
     */
    getAndMergeSettings: function(noWrapper) {
        return new Promise((resolve) => {
            const name = this.settingsName();
            
            storage.get(name, (settings) => {
                this.mergeSettings(settings);
                
                if (noWrapper && settings) {
                    settings = settings[name];
                }
                
                resolve(settings);
            });
        });
    }
};

export { Settings };