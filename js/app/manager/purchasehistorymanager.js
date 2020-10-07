'use strict';

import { Steam } from '../steam/steam.js';
import { sleep } from '../helpers/utils.js';
import { createLocalStorageManager } from './storage/local.js';
import { parseTransactions } from '../parsers/parseTransactions.js';

/**
 * Creates a PurchaseHistoryManager.
 * @param {Object} deps - Dependencies.
 * @param {Object} deps.account - Account to loading listings from. Should contain wallet currency.
 * @returns {PurchaseHistoryManager} A new PurchaseHistoryManager.
 */
export function createPurchaseHistoryManager({ account }) {
    /**
     * Current Steam session data.
     *
     * @namespace PurchaseHistoryManager.session
     * @memberOf PurchaseHistoryManager
     * @property {(String|undefined)} sessionid - Logged in sessionid.
     */
    let session = {};
    
    /**
     * Loads data from Steam.
     * @param {Objec} data - Request parameters.
     * @returns {Promise.<Object>} Response JSON from Steam on resolve, error with details on reject.
     */
    async function getPurchaseHistory(data) {
        const response = await Steam.requests.post.purchasehistory(data);
        
        if (!response.ok) {
            return Promise.reject(response.statusText);
        }
        
        return response.json();
    }
    
    /**
     * Module for loading & parsing purchase history from Steam.
     * 
     * Must be logged in to use.
     * @class PurchaseHistoryManager
     */
    return {
        /**
         * Configures the module.
         * @memberOf PurchaseHistoryManager
         * @returns {Promise} Resolve when done.
         */
        setup: async function() {
            session = await Steam.getSteamPoweredSession();
        },
        /**
         * Loads Steam transaction history.
         * @memberOf PurchaseHistoryManager
         * @param {Object} cursor - Position from last fetched result (provided by response from Steam).
         * @param {number} [delay=0] - Delay in Seconds to load.
         * @returns {Promise.<PurchaseHistoryManagerLoadResponse>} Resolves with response when done.
         */
        load: async function(cursor, delay = 0) {
            // session for store.steampowered must be present
            const { sessionid } = session;
            
            if (!sessionid) {
                return Promise.reject('No login');
            }
            
            await sleep(delay * 1000);
            
            const response = await getPurchaseHistory({
                sessionid,
                cursor
            });
            // parse the transaction
            const records = parseTransactions(response, account.wallet.currency, account.locales);
            
            /**
             * Load result.
             * @typedef {Object} PurchaseHistoryManagerLoadResponse
             * @property {AccountTransaction[]} records - Array of transactions.
             * @property {Object} [cursor] - Cursor for next load.
             */
            return {
                records,
                cursor: response.cursor
            };
        }
    };
}