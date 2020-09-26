'use strict';

// this is the only class tied to the database
import { Listing } from '../classes/listing.js';

/**
 * Configures database - should be called after locales have been loaded.
 * @param {string} steamid - SteamID64 this database would belong to.
 * @returns {Object} Configured Dexie instance.
 */
export function createListingDatabase(steamid) {
    // uses steamid for db name
    const db = new Dexie(`listings${steamid}`);
    
    db.version(1).stores({
        listings: [
            '&transaction_id',
            'index',
            'sale_type',
            'appid',
            'contextid',
            'assetid',
            'classid',
            'instanceid',
            'name',
            'market_name',
            'market_hash_name',
            'name_color',
            'background_color',
            'icon_url',
            'date_acted',
            'date_listed',
            'date_acted_raw',
            'date_listed_raw',
            'price',
            'price_raw',
            'seller'
        ].join(','),
        ingame: [
            '&transaction_id',
            'appid',
            'market_name',
            'price',
            'price_raw',
            'date'
        ].join(',')
    });
    
    db.version(2).stores({
        listings: [
            '&transaction_id',
            'index',
            'is_credit',
            'appid',
            'contextid',
            'assetid',
            'classid',
            'instanceid',
            'name',
            'market_name',
            'market_hash_name',
            'name_color',
            'background_color',
            'icon_url',
            'date_acted',
            'date_listed',
            'date_acted_raw',
            'date_listed_raw',
            'price',
            'price_raw',
            'seller'
        ].join(',')
    }).upgrade((trans) => {
        return trans.listings.toCollection().modify((record) => {
            record.is_credit = record.sale_type == 1 ? 1 : 0;
            
            delete record.sale_type;
        });
    });
    
    db.listings.mapToClass(Listing);
    
    return db;
}