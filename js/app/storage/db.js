export function createDatabaseSettingsManager(db, tableName, primaryKey, defaults = {}) {
    const table = db[tableName];
    
    return {
        /**
         * Gets the settings.
         * @memberOf ListingManager
         * @param {boolean} noWrapper - Get settings object without wrapper.
         * @returns {Promise<Object>} Resolves with settings when done.
         */
        getSettings: async function() {
            const record = await table.get(primaryKey);
            
            if (record) {
                return Object.assign({}, defaults, record);
            }
            
            return defaults;
        },
        /**
         * Saves the settings.
         * @memberOf ListingManager
         * @returns {Promise} Resolves when done.
         */
        saveSettings: async function(settingsToSave) {
            const primKey = table.schema.primKey.keyPath;
            // the full data set
            const fullData = Object.assign({}, {
                [primKey]: primaryKey
            }, settingsToSave);
            const data = fullData;
            
            // add or update the data on the database
            return table.put(data);
        },
        /**
         * Deletes the settings.
         * @memberOf ListingManager
         * @returns {Promise} Resolves when done.
         */
        deleteSettings: async function() {
            return db[tableName].delete(primaryKey);
        }
    };
};
