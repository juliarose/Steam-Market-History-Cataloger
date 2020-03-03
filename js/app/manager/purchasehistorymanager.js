'use strict';

import { Steam } from '../steam/steam.js';
import { delayPromise } from '../helpers/utils.js';
import { createLocalStorageManager } from './helpers/createLocalStorageManager.js';
import { parseTransactions } from '../parsers/parseTransactions.js';

/**
 * Creates a PurchaseHistoryManager.
 * @param {Object} deps - Dependencies.
 * @param {Object} deps.account - Account to loading listings from. Should contain wallet currency.
 * @returns {PurchaseHistoryManager} A new PurchaseHistoryManager.
 */
function createPurchaseHistoryManager({ account }) {
    /**
     * Module for loading & parsing purchase history from Steam.
     * 
     * Must be logged in to use.
     * @class PurchaseHistoryManager
     * @type {Manager}
     * @property {string} settings_name - Key for storing data.
     */
    return createLocalStorageManager({
        settings_name: 'purchasehistory',
        /**
         * Current Steam session data.
         *
         * @namespace PurchaseHistoryManager.session
         * @memberOf PurchaseHistoryManager
         * @property {(String|undefined)} steamid - Logged in steamid.
         * @property {(String|undefined)} sessionid - Logged in sessionid.
         */
        session: {},
        /**
         * Configures the module.
         * @memberOf PurchaseHistoryManager
         * @returns {Promise} Resolve when done.
         */
        setup: async function() {
            this.session = await Steam.getSteamPoweredSession();
        },
        /**
         * Loads Steam transaction history.
         * @memberOf PurchaseHistoryManager
         * @param {Object} cursor - Position from last fetched result (provided by response from Steam).
         * @param {number} [delay=0] - Delay in Seconds to load.
         * @returns {Promise.<PurchaseHistoryManagerLoadResponse>} Resolves with response when done.
         */
        load: async function(cursor, delay = 0) {
            const manager = this;
            // session for store.steampowered must be present
            const sessionid = manager.session.sessionid;
            
            if (!sessionid) {
                return Promise.reject('No login');
            }
            
            await delayPromise(delay * 1000);
            
            const response = await manager.get({
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
        },
        /**
         * Loads data from Steam.
         * @memberOf PurchaseHistoryManager
         * @param {Objec} data - Request parameters.
         * @returns {Promise.<Object>} Response JSON from Steam on resolve, error with details on reject.
         */
        get: async function(data) {
            const response = await Steam.requests.post.purchasehistory(data);
            
            if (!response.ok) {
                return Promise.reject(response.statusText);
            }
            
            return response.json();
        }
    });
}

export { createPurchaseHistoryManager };