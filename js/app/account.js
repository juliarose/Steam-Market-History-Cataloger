// @ts-check

import { AppError } from './error.js';
import { LocalStorage } from './storage/local.js';
import { getCurrency } from './currency.js';
import { Localization } from './classes/Localization.js';

/**
 * @typedef {import('./currency.js').Currency} Currency
 */

/**
 * Wallet.
 * @typedef {Object} Wallet
 * @property {Currency} currency - The currency of the wallet.
 */

/**
 * Account.
 * @typedef {Object} Account
 * @property {Localization} locales - The localization data.
 * @property {string} steamid - The steamid of the user.
 * @property {string} username - The username of the user.
 * @property {string} avatar - The avatar of the user.
 * @property {Wallet} wallet - The wallet of the user.
 * @property {string} language - The language of the user.
 */

/**
 * Loads account.
 * @returns {Promise<Account>} Account data.
 */
export async function loadAccount() {
    const accountLocalStorage = new LocalStorage('logged_in_user');
    const accountData = await accountLocalStorage.getSettings();
    const steamid = accountData.steamcommunity;
    const { avatar, username } = accountData;
    const accountInfoLocalStorage = new LocalStorage(`${steamid}_accountinfo`);
                
    if (steamid == null) {
        throw new AppError('No steamcommunity.com login detected. Either login or view a page on steamcommunity.com to configure login.');
    }
    
    const accountInfoData = await accountInfoLocalStorage.getSettings();
    const { language } = accountInfoData;
            
    if (!language) {
        throw new AppError('No language detected');
    }
    
    if (!accountInfoData.wallet_currency) {
        throw new AppError('No wallet detected.');
    }
    
    const currency = getCurrency(accountInfoData.wallet_currency);
    
    if (!currency) {
        // currency was not found on sotrage
        throw new AppError(`No currency detected with ID "${accountInfoData.wallet_currency}"`);
    }
    
    const locales = await Localization.get(language);
    
    return {
        locales,
        steamid,
        username,
        avatar,
        language,
        wallet: {
            currency
        }
    };
}
