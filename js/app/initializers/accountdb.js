'use strict';

/**
 * Configures database - should be called after locales have been loaded.
 * @param {Object} account - Account this database would belong to.
 * @returns {Promise.<Object>} Resolve with DB object when done, reject if no steamid is available.
 */
function configureDB() {
    return new Promise((resolve) => {
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
        
        resolve(db);
    });
}

export { configureDB };