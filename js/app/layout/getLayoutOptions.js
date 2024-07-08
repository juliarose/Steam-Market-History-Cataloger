// @ts-check

/**
 * @typedef {import('../account.js').Account} Account
 * @typedef {import('../preferences.js').Preferences} Preferences
 * @typedef {import('../models/Localization.js').Localization} Localization
 * @typedef {import('../currency.js').Currency} Currency
 */

/**
 * Object containing options to use in formatting.
 * @typedef {Object} LayoutOptions
 * @property {number} count - Number of items for pagination results.
 * @property {Localization} locales - Object containing localizations.
 * @property {Currency} currency - Currency related to account.
 */

/**
 * Gets options to pass to a layout method.
 * @param {Object} options - Options.
 * @param {Account} options.account - Account.
 * @param {Preferences} options.preferences - Preferences.
 * @returns {LayoutOptions} Object containing options to use in formatting.
 */
export function getLayoutOptions({ account, preferences }) {
    return {
        count: preferences.pagination_count,
        locales: account.locales,
        currency: account.wallet.currency
    };
}
