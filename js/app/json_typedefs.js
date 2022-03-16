// typedefs for JSON exports
// Used for user documentation purposes

/**
 * The output data when exporting listings to JSON.
 * @typedef {Object} ListingsJSON
 * @property {string} steamid - The steamid of the account.
 * @property {Currency} currency - The currency of your Steam wallet.
 * @property {Listing[]} listings - An array of listings.
 */

/**
 * A currency used for prices.
 * @typedef {Object} Currency
 * @property {number} wallet_code - The ID of the currency from Steam.
 * @property {string} code - ISO 4217 currency code e.g. "USD".
 * @property {string} symbol - Currency symbol e.g. "$".
 * @property {number} precision - Decimal place precision e.g. 2 decimal places for USD.
 * @property {string} thousand - Thousand place character.
 * @property {string} decimal - Decimal place character.
 * @property {boolean} [spacer] - Whether the amount should be displayed with a space between the number and symbol.
 * @property {boolean} [after] - Whether the symbol should be displayed after the number.
 * @property {boolean} [trim_trailing] - Whether trailing zeroes should be trimmed on whole values.
 * @property {number} [format_precision] - Decimal place precision used in formatting.
 */

/**
 * A listing from your Steam market history at https://steamcommunity.com/market/.
 * @typedef {Object} Listing
 * @property {string} transaction_id - Transaction ID.
 * @property {string} appid - App ID.
 * @property {string} contextid - Context ID.
 * @property {string} classid - Class ID.
 * @property {string} instanceid - Instance ID.
 * @property {number} index - Index of listing in history.
 * @property {number} price - Integer value of price formatted to the precision defined by its currency e,g. 100 for $1.00.
 * @property {boolean} is_credit - Whether the transaction resulted in credit or not.
 * @property {string} name - Name.
 * @property {string} market_name - Market name.
 * @property {string} market_hash_name - Market hash name.
 * @property {string} icon - Icon path on Steam's CDN.
 * @property {string} [name_color] - 6-digit hexademical color for name.
 * @property {string} [background_color] - 6-digit hexademical color for background.
 * @property {Date} date_acted - Date acted.
 * @property {Date} date_listed - Date listed.
 */

/**
 * A row from your Steam account purchase history at https://store.steampowered.com/account/history/.
 * @typedef {Object} AccountTransaction
 * @property {number} transaction_type - A value fom ETransactionType.
 * @property {Date} date - Date of transaction.
 * @property {number} count - Number of this type of transaction.
 * @property {number} price - Integer value of price formatted to the precision defined by its currency e,g. 100 for $1.00.
 * @property {boolean} is_credit - Whether the transaction resulted in credit or not.
 */

/**
 * An item from an in-game purchase belonging to an account transaction (currently unused).
 * @typedef {Object} GameItem
 * @property {string} app - App name.
 * @property {number} count - Number of this particular item.
 * @property {string} name - Name.
 * @property {number} price - Price of item(s).
 */