'use string';

/**
 * Gets options to pass to a layout method.
 * @returns {LayoutOptions} Object containing options to use in formatting.
 */
function getLayoutOptions({account, preferences}) {
    /**
     * Object containing options to use in formatting.
     * @typedef {Object} LayoutOptions
     * @property {Number} count - Number of items for pagination results.
     * @property {Object} locales - Object containing locale strings for UI.
     * @property {Currency} currency - Currency related to account.
     */
    return {
        count: preferences.settings.pagination_count,
        locales: account.locales.ui,
        currency: account.wallet.currency
    };
}

export {getLayoutOptions};