'use strict';

export function createDatabaseSettingsManager(db, tableName, primaryKey, defaults = {}) {
    const table = db[tableName];
    
    return {
        /**
         * Gets the settings.
         * @memberOf ListingManager
         * @param {boolean} noWrapper - Get settings object without wrapper.
         * @returns {Promise.<Object>} Resolve with settings when done.
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
         * @param {Object} settingsToSave - Any settings to save.
         * @returns {Promise} Resolve when done.
         */
        saveSettings: async function(settingsToSave) {
            const primKey = table.schema.primKey.keyPath;
            // the full data set
            const fullData = Object.assign({}, {
                [primKey]: primaryKey
            }, settingsToSave);
            //// the columns from the schema
            //const columns = [
            //    table.schema.primKey,
            //    ...table.schema.indexes
            //].filter(Boolean).map(index => index.keyPath);
            //// the data set with only the database columns
            //const data = pickKeys(fullData, columns);
            const data = fullData;
            
            // add or update the data on the database
            return table.put(data);
        },
        /**
         * Deletes the settings.
         * @memberOf ListingManager
         * @returns {Promise} Resolve when done.
         */
        deleteSettings: async function() {
            return db[tableName].delete(primaryKey);
        }
    };
};