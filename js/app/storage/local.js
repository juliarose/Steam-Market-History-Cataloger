import { storage } from '../browser.js';

/**
 * Interface for working with localStorage.
 */
export class LocalStorage {
    /**
     * Name for settings.
     * @type {string}
     * @private
     */
    #settingsName = null;
    
    constructor(settingsName) {
        this.#settingsName = settingsName;
    }
    
    /**
     * Gets the settings name.
     * @returns {string} Name for settings.
     */
    settingsName() {
        return this.#settingsName;
    }
    
    /**
     * Gets the settings.
     * @returns {Promise<(Object | undefined)>} Resolves with settings when done.
     */
    async getSettings() {
        return new Promise((resolve) => {
            const name = this.settingsName();
            
            storage.get(name, (settings) => {
                if (settings) {
                    settings = settings[name];
                }
                
                resolve(settings);
            });
        });
    }
    
    /**
     * Saves the settings.
     * @param {Object} settings - Object to save.
     * @returns {Promise<void>} Resolves when done.
     */
    async saveSettings(settings) {
        return new Promise((resolve) => {
            const name = this.settingsName();
            
            storage.set({
                [name]: settings
            }, resolve);
        });
    }
    
    /**
     * Deletes the settings.
     * @returns {Promise<void>} Resolves when done.
     */
    async deleteSettings() {
        return this.saveSettings({});
    }
}
