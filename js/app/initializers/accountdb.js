'use strict';

/**
 * Configures database - should be called after locales have been loaded.
 * @param {Object} account - Account this database would belong to.
 * @returns {Object} Configured Dexie instance.
 */
function createAccountDatabase() {
    const db = new Dexie('listings.accounts');
    
    db.version(1).stores({
        listings: [
            '&steamid',
            'current_index',
            'total_count',
            'last_index',
            'last_fetched_index',
            'recorded_count',
            'session',
            'language',
            'date'
        ].join(',')
    });
    
    db.version(2).stores({
        listings: [
            '&steamid',
            'current_index',
            'total_count',
            'last_index',
            'last_fetched_index',
            'recorded_count',
            'session',
            'language',
            // add this
            'is_loading',
            'date'
        ].join(',')
    });
    
    return db;
}

export { createAccountDatabase };