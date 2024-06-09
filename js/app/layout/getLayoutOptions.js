'use string';

/**
 * Gets options to pass to a layout method.
 * @param {Account} account - Account.
 * @param {Preferences} preferences - Preferences.
 * @returns {LayoutOptions} Object containing options to use in formatting.
 */
export function getLayoutOptions({ account, preferences }) {
    /**
     * Object containing options to use in formatting.
     * @typedef {Object} LayoutOptions
     * @property {number} count - Number of items for pagination results.
     * @property {Localizations} locales - Object containing localizations.
     * @property {Localization} currency - Currency related to account.
     */
    return {
        count: preferences.pagination_count,
        locales: account.locales,
        currency: account.wallet.currency
    };
}
