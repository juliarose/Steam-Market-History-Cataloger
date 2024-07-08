// @ts-check

/**
 * Database settings manager.
 */
export class DatabaseSettingsManager {
    /**
     * The Dexie database.
     * @type {Object}
     */
    #db;
    /**
     * The table name to use from `db`.
     * @type {string}
     */
    #tableName;
    /**
     * The primary key of the table.
     * @type {string}
     */
    #primaryKey;
    /**
     * The default settings.
     * @type {Object}
     */
    #defaults;
    /**
     * The table to use.
     * @type {Object}
     */
    #table;
    
    /**
     * Creates a new database settings manager.
     * @param {Object} db - The Dexie database.
     * @param {string} tableName - The table name to use from `db`.
     * @param {string} primaryKey - The primary key of the table.
     * @param {Object} defaults - The default settings.
     */
    constructor(db, tableName, primaryKey, defaults = {}) {
        this.#db = db;
        this.#tableName = tableName;
        this.#primaryKey = primaryKey;
        this.#defaults = defaults;
        this.#table = db[tableName];
    }
    
    /**
     * Gets the settings.
     * @returns {Promise<Object>} Resolves with settings when done.
     */
    async getSettings() {
        const record = await this.#table.get(this.#primaryKey);
        
        if (record) {
            return Object.assign({}, this.#defaults, record);
        }
        
        return this.#defaults;
    }
    
    /**
     * Saves the settings.
     * @param {Object} settingsToSave - The settings to save.
     * @returns {Promise<void>} Resolves when done.
     */
    async saveSettings(settingsToSave) {
        const primKey = this.#table.schema.primKey.keyPath;
        // the full data set
        const data = Object.assign({}, {
            [primKey]: this.#primaryKey
        }, settingsToSave);
        
        // add or update the data on the database
        return this.#table.put(data);
    }
    
    /**
     * Deletes the settings.
     * @returns {Promise<void>} Resolves when done.
     */
    async deleteSettings() {
        return this.#db[this.#tableName].delete(this.#primaryKey);
    }
}
