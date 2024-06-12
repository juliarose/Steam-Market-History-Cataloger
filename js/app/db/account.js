'use strict';

import { Dexie } from '../dexie.js';

/**
 * Configures database - should be called after locales have been loaded.
 * @param {Object} account - Account this database would belong to.
 * @returns {Object} Configured Dexie instance.
 */
export function createAccountDatabase() {
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
    
    /*
    dbv.version(3).stores({
        listings: [
            '&steamid',
            'current_index',
            'total_count',
            'last_index',
            'last_fetched_index',
            'recorded_count',
            'session',
            'language',
            'is_loading',
            'date'
        ].join(','),
        preferences: [
            'market_per_page',
            'market_poll_interval_seconds',
            'background_poll_boolean',
            'background_poll_interval_minutes',
            'show_new_listing_count',
            'pagination_count'
        ],
        account: [
            'steamid',
            'username',
            'language'
        ]
    });
    */
    
    return db;
}