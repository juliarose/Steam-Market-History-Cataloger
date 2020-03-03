'use string';

/**
 * Gets options to pass to a layout method.
 * @param {Object} options - Options.
 * @returns {LayoutOptions} Object containing options to use in formatting.
 */
function getLayoutOptions({ account, preferences }) {
    /**
     * Object containing options to use in formatting.
     * @typedef {Object} LayoutOptions
     * @property {number} count - Number of items for pagination results.
     * @property {Localizations} locales - Object containing localizations.
     * @property {Localization} currency - Currency related to account.
     */
    return {
        count: preferences.settings.pagination_count,
        locales: account.locales,
        currency: account.wallet.currency
    };
}

export { getLayoutOptions };