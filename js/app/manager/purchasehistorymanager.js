'use strict';

import {Steam} from '../steam/steam.js';
import {delayPromise} from '../helpers/utils.js';
import {createManager} from './helpers/createManager.js';
import {parseTransactions} from '../parsers/parseTransactions.js';

/**
 * Creates a PurchaseHistoryManager.
 * @param {Object} deps - Dependencies.
 * @param {Object} deps.account - Account to loading listings from. Should contain wallet currency.
 * @returns {PurchaseHistoryManager} A new PurchaseHistoryManager.
 */
function createPurchaseHistoryManager({account}) {
    /**
     * Module for loading & parsing purchase history from Steam.
     * 
     * Must be logged in to use.
     * @class PurchaseHistoryManager
     * @type {Manager}
     * @property {String} settings_name - Key for storing data.
     */
    return createManager({
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
        setup: function() {
            return Steam.getSteamPoweredSession()
                .then((session) => {
                    this.session = session;
                });
        },
        /**
         * Loads Steam transaction history.
         * @memberOf PurchaseHistoryManager
         * @param {Object} cursor - Position from last fetched result (provided by response from Steam).
         * @param {Number} [delay=0] - Delay in Seconds to load.
         * @returns {Promise.<PurchaseHistoryManagerLoadResponse>} Resolves with response when done.
         */
        load: function(cursor, delay = 0) {
            const manager = this;
            // session for store.steampowered must be present
            const currency = account.wallet.currency;
            const sessionid = manager.session.sessionid;
            
            /**
             * Loads data.
             * @param {Object} [cursor] - Cursor from previous request.
             * @returns {Promise.<PurchaseHistoryManagerLoadResponse>} Resolves with response when done.
             */
            function load() {
                /**
                 * Parses the response.
                 * @param {Object} response - Response from Steam.
                 * @returns {PurchaseHistoryManagerLoadResponse} Response object.
                 */
                const onSuccess = (response) => {
                    const records = parseTransactions(response, currency);
                    const {cursor} = response;
                    
                    /**
                     * Load result.
                     * @typedef {Object} PurchaseHistoryManagerLoadResponse
                     * @property {AccountTransaction[]} records - Array of transactions.
                     * @property {Object} [cursor] - Cursor for next load.
                     */
                    return {
                        records,
                        cursor
                    };
                };
                const data = {
                    sessionid,
                    cursor
                };
                
                return manager.get(data)
                    .then(onSuccess);
            }
            
            function checkState() {
                if (!sessionid) {
                    return Promise.reject('No login');
                }
                
                return Promise.resolve();
            }
            
            return checkState()
                .then(delayPromise(delay * 1000))
                .then(load);
        },
        /**
         * Loads data from Steam.
         * @memberOf PurchaseHistoryManager
         * @param {Objec} data - Request parameters.
         * @returns {Promise.<Object>} Response JSON from Steam on resolve, error with details on reject.
         */
        get: function(data) {
            return Steam.requests.post.purchasehistory(data)
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        return Promise.reject(response.statusText);
                    }
                });
        }
    });
}

export {createPurchaseHistoryManager};