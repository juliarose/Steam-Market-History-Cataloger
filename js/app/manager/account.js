'use strict';

import { createLocalStorageManager } from './storage/local.js';
import { getCurrency } from '../currency.js';
import { Localization } from '../classes/localization.js';

/**
 * Creates an AccountManager.
 * @returns {AccountManager} A new AccountManager.
 */
export function createAccountManager() {
    /**
     * Current logged in user settings manager.
     * @class AccountManager
     * @type {Manager}
     * @property {string} settings_name - Key for storing data.
     * @property {(Localization|null)} locales - Localization strings in the language for the account. Defined during setup.
     */
    const account = createLocalStorageManager({
        settings_name: 'logged_in_user',
        locales: null,
        /**
         * Details relating to wallet will be stored here when data is loaded.
         * @namespace account.wallet
         * @memberOf AccountManager
         */
        wallet: {},
        /**
         * @namespace account.info
         * @memberOf AccountManager
         * @type {Manager}
         */
        info: createLocalStorageManager({
            settings_name: 'accountinfo',
            /**
             * Overrides function from Manager.
             * @memberOf AccountManager.info
             * @returns {(string|null)} Key name for settings with steamid linked to currently logged-in account.
             */
            settingsName: function() {
                const steamid = account.steamid;
                
                if (steamid == null) {
                    return null;
                }
                
                return [
                    steamid,
                    this.settings_name
                ].join('_');
            },
            /**
             * Assign values relating to wallet from stored settings.
             * @memberOf AccountManager.info
             * @returns {undefined}
             */
            assignWalletValues: function() {
                const pattern = /^wallet_/;
                
                for (let k in this.settings) {
                    if (pattern.test(k)) {
                        account.wallet[k] = this.settings[k];
                    }
                }
                
                account.wallet.currency = getCurrency(this.settings.wallet_currency);
            },
            /**
             * Configures the module.
             * @memberOf AccountManager.info
             * @returns {Promise} Resolve when done, reject when data is missing.
             */
            setup: async function() {
                await this.getAndMergeSettings();
                
                if (!this.settings.wallet_currency) {
                    return Promise.reject('No wallet detected.');
                }
                
                if (!this.settings.language) {
                    return Promise.reject('No language detected');
                }
                
                this.assignWalletValues();
                
                if (!account.wallet.currency) {
                    const currencyID = this.settings.wallet_currency;
                    
                    // currency was not found on sotrage
                    return Promise.reject(`No currency detected with ID "${currencyID}"`);
                }
                
                account.language = this.settings.language;
                account.locales = await Localization.get(account.language);
            }
        }),
        /**
         * Configures the module.
         * @memberOf AccountManager
         * @returns {Promise} Resolve when done.
         */
        setup: async function() {
            // get english as the default language
            this.locales = await Localization.get('english');
            
            await this.getAndMergeSettings();
            
            this.steamid = this.settings.steamcommunity;
            this.username = this.settings.username;
            this.avatar = this.settings.avatar;
            
            if (!this.steamid) {
                return Promise.reject('No steamcommunity.com login detected. Either login or view a page on steamcommunity.com to configure login.');
            }
            
            await this.info.setup();
        }
    });
    
    return account;
}