'use strict';

import { createManager } from './helpers/createManager.js';
import { getCurrency } from '../currency.js';
import { Localization } from '../classes/localization.js';

/**
 * Creates an AccountManager.
 * @returns {AccountManager} A new AccountManager.
 */
function createAccountManager() {
    /**
     * Current logged in user settings manager.
     * @class AccountManager
     * @type {Manager}
     * @property {String} settings_name - Key for storing data.
     * @property {Localization} locales - Localization strings in the language for the account.
     */
    const account = createManager({
        settings_name: 'logged_in_user',
        locales: new Localization(),
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
        info: createManager({
            settings_name: 'accountinfo',
            /**
             * Overrides function from Manager.
             * @memberOf AccountManager.info
             * @returns {(String|null)} Key name for settings with steamid linked to currently logged-in account.
             */
            settingsName: function() {
                const steamid = account.steamid;
                
                if (steamid != null) {
                    return [
                        steamid,
                        this.settings_name
                    ].join('_');
                } else {
                    return null;
                }
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
             * @returns {Promise.<Object>} Resolve when done, reject when data is missing.
             */
            setup: async function() {
                await this.getAndMergeSettings();
                
                if (!this.settings.wallet_currency) {
                    return Promise.reject('No wallet detected. You may need to open a page on Steam.');
                } else if (!this.settings.language) {
                    return Promise.reject('No language detected');
                }
                
                this.assignWalletValues();
                
                if (!account.wallet.currency) {
                    const currencyID = this.settings.wallet_currency;
                    
                    // currency was not found on sotrage
                    return Promise.reject(`No currency detected with ID "${currencyID}"`);
                }
                
                account.language = this.settings.language;
                
                return account.locales.get(account.language);
            }
        }),
        /**
         * Configures the module.
         * @memberOf AccountManager
         * @returns {Promise.<Object>} Resolve with basic account data when done, reject when data is missing.
         */
        setup: async function() {
            // get english as the default language
            await this.locales.get('english')
            await this.getAndMergeSettings();
            
            this.steamid = this.settings.steamcommunity;
            this.username = this.settings.username;
            this.avatar = this.settings.avatar;
            
            if (!this.steamid) {
                return Promise.reject('Not logged into Steam');
            }
            
            await this.info.setup();
            
            return {
                locales: this.locales,
                steamid: this.steamid,
                language: this.info.settings.language,
                currency: this.wallet.currency
            };
        }
    });
    
    return account;
}

export { createAccountManager };