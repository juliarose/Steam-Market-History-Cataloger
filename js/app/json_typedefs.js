// typedefs for JSON exports
// Used for user documentation purposes

/**
 * A currency used for prices.
 * @typedef {Object} Currency
 * @property {Number} wallet_code - The ID of the currency from Steam.
 * @property {String} code - ISO 4217 currency code e.g. "USD".
 * @property {String} symbol - Currency symbol e.g. "$".
 * @property {Number} precision - Decimal place precision.
 * @property {String} thousand - Thousand place character.
 * @property {String} decimal - Decimal place character.
 * @property {Boolean} [spacer] - Whether the amount should be displayed with a space between the number and symbol.
 * @property {Boolean} [after] - Whether the symbol should be displayed after the number.
 * @property {Boolean} [trim_trailing] - Whether trailing zeroes should be trimmed on whole values.
 * @property {Number} [format_precision] - Decimal place precision used in formatting.
 */

/**
 * A listing from Steam's market history at https://steamcommunity.com/market/.
 * @typedef {Object} Listing
 * @property {String} transaction_id - Transaction ID.
 * @property {String} appid - Appid for item.
 * @property {String} contextid - Contextid for item.
 * @property {String} classid - Classid for item.
 * @property {String} instanceid - Instanceid for item.
 * @property {Number} index - Index of listing in history.
 * @property {Number} price - Integer value of price formatted to the precision defined by its currency e,g. 100 for $1.00.
 * @property {Boolean} is_credit - Whether the transaction resulted in credit or not.
 * @property {String} name - Name of item.
 * @property {String} market_name - Market name of item.
 * @property {String} market_hash_name - Market hash name for item.
 * @property {String} icon - Icon path on Steam's CDN.
 * @property {String} [name_color] - 6-digit hexademical color for name.
 * @property {String} [background_color] - 6-digit hexademical color for background.
 * @property {Date} date_acted - Date acted.
 * @property {Date} date_listed - Date listed.
 */

/**
 * A row from Steam's account purchase history at https://store.steampowered.com/account/history/.
 * @typedef {Object} AccountTransaction
 * @property {Number} transaction_type - A value fom ETransactionType.
 * @property {Date} date - Date of transaction.
 * @property {Number} count - Number of this type of transaction.
 * @property {Number} price - Integer value of price formatted to the precision defined by its currency e,g. 100 for $1.00.
 * @property {Boolean} is_credit - Whether the transaction resulted in credit or not.
 */

/**
 * An item from an in-game purchase belonging to an account transaction.
 * @typedef {Object} GameItem
 * @property {String} app - App name.
 * @property {Number} count - Number of this particular item.
 * @property {Date} name - Name of item.
 * @property {Boolean} price - Price of item(s).
 */