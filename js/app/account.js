import { AppError } from './error.js';
import { LocalStorage } from './storage/local.js';
import { getCurrency } from './currency.js';
import { Localization } from './classes/localization.js';

/**
 * @typedef {import('./currency.js').Currency} Currency
 * @typedef {import('./classes/localization.js').Localization} Localization
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
 * Wallet.
 * @typedef {Object} Wallet
 * @property {Currency} currency - The currency of the wallet.
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
    const wallet = {};
    const { language } = accountInfoData;
            
    if (!language) {
        throw new AppError('No language detected');
    }
    
    if (!accountInfoData.wallet_currency) {
        throw new AppError('No wallet detected.');
    }
    
    wallet.currency = getCurrency(accountInfoData.wallet_currency);
    
    if (!wallet.currency) {
        // currency was not found on sotrage
        throw new AppError(`No currency detected with ID "${accountInfoData.wallet_currency}"`);
    }
    
    const locales = await Localization.get(language);
    
    return {
        locales,
        steamid,
        username,
        avatar,
        wallet,
        language,
    };
}
