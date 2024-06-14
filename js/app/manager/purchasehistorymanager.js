import { getSteamPoweredSession } from '../steam/index.js';
import { sleep } from '../helpers/utils.js';
import { getPurchaseHistory } from '../steam/requests/post.js';
import { parseTransactions } from '../parsers/parseTransactions.js';
import { AppError } from '../error.js';

/**
 * @typedef {import('../classes/accounttransaction.js').AccountTransaction} AccountTransaction
 * @typedef {import('../account.js').Account} Account
 */

/**
 * Load result.
 * @typedef {Object} PurchaseHistoryManagerLoadResponse
 * @property {AccountTransaction[]} records - Array of transactions.
 * @property {Object} [cursor] - Cursor for next load.
 */

/**
 * Used for managing purchase history requests.
 */
export class PurchaseHistoryManager {
    /**
     * Current Steam session data.
     * @type {Object} sessionid - Logged in sessionid.
     * @private
     */
    #session = {
        /**
         * Logged in sessionid.
         * @type {(string | null)} sessionid - Logged in sessionid.
         */
        sessionid: null,
    };
    /**
     * Account. Should contain wallet currency.
     * @type {Account}
     * @private
     */
    #account = null;
    
    /**
     * Creates a PurchaseHistoryManager.
     * @param {Object} deps - Dependencies.
     * @param {Account} deps.account - Account to loading listings from. Should contain wallet currency.
     */
    constructor({ account }) {
        this.#account = account;
    }
    
    /**
     * Loads data from Steam.
     * @param {Object} data - Request parameters.
     * @returns {Promise<Object>} Response JSON from Steam on resolve, error with details on reject.
     * @private
     */
    async #getPurchaseHistory(data) {
        const response = await getPurchaseHistory(data);
        
        if (!response.ok) {
            throw new AppError(response.statusText);
        }
        
        return response.json();
    }
    
    /**
     * Configures the module.
     * @returns {Promise<void>} Resolves when done.
     */
    async setup() {
        this.#session = await getSteamPoweredSession();
    }
    
    /**
     * Loads Steam transaction history.
     * @param {Object} cursor - Position from last fetched result (provided by response from Steam).
     * @param {number} [delay=0] - Delay in Seconds to load.
     * @returns {Promise<PurchaseHistoryManagerLoadResponse>} Resolves with response when done.
     */
    async load(cursor, delay = 0) {
        // session for store.steampowered must be present
        const { sessionid } = this.#session;
        
        if (!sessionid) {
            throw new AppError('No login');
        }
        
        await sleep(delay * 1000);
        
        const response = await this.#getPurchaseHistory({
            sessionid,
            cursor
        });
        // parse the transaction
        const records = parseTransactions(
            response,
            this.#account.wallet.currency,
            this.#account.locales
        );
        
        return {
            records,
            cursor: response.cursor
        };
    }
}
