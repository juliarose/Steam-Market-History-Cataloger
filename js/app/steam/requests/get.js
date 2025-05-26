// @ts-check

import { queryString } from '../../helpers/utils.js';
import { getXHR } from './helpers/getXHR.js';

/**
 * Parameters for CORS requests.
 * @type {RequestInit}
 */
const corsParams = {
    /**@type {string} */
    method: 'GET',
    /** @type {RequestCredentials} Request credentials. */
    credentials: 'include',
    /** @type {RequestMode} Request credentials. */
    mode: 'cors',
    /**@type {string} */
    referrer: 'no-referrer'
};

/* Example response:
{
    "success": true,
    "pagesize": 1,
    "total_count": 321389,
    "start": 0,
    "assets": {
      "440": {
        "2": {
          "7708744609": {
            "currency": 0,
            "appid": 440,
            "contextid": "2",
            "id": "7708744609",
            "classid": "1336074346",
            "instanceid": "11040852",
            "amount": "0",
            "status": 4,
            "original_amount": "1",
            "unowned_id": "7708744609",
            "unowned_contextid": "2",
            "background_color": "3C352E",
            "icon_url": "fWFc82js0fmoRAP-qOIPu5THSWqfSmTELLqcUywGkijVjZULUrsm1j-9xgEIUxceSh7wsjlAg_fqDOCLDa5Sw4k2tsNQ2mcykAQjMOLlZTM2c1zEAPNbDfM_oA61XnFksJc1DNbuuasILrs_4Bfd",
            "icon_url_large": "fWFc82js0fmoRAP-qOIPu5THSWqfSmTELLqcUywGkijVjZULUrsm1j-9xgEIUxceSh7wsjlAg_fqDOCLDa5Sw4k2tsNQ2mcykAQjMOLlZTM2c1zEAPNbDfM_oA61XnFksJc1DNbuuasILrs_4Bfd",
            "descriptions": [
              {
                "value": "When weapon is active:"
              },
              {
                "value": "+15% faster move speed on wearer",
                "color": "7ea9d1"
              },
              {
                "value": "+25 health restored on kill",
                "color": "7ea9d1"
              },
              {
                "value": "20% damage vulnerability on wearer",
                "color": "d83636"
              },
              {
                "value": " "
              },
              {
                "value": "The Gas Jockey's Gear",
                "color": "e1e10f"
              },
              {
                "value": " "
              },
              {
                "value": "The Degreaser",
                "color": "8b8989"
              },
              {
                "value": "The Powerjack",
                "color": "8b8989"
              },
              {
                "value": "The Attendant",
                "color": "8b8989"
              },
              {
                "value": " "
              },
              {
                "value": "Item Set Bonus:",
                "color": "e1e10f"
              },
              {
                "value": "Leave a Calling Card on your victims",
                "color": "8b8989"
              }
            ],
            "tradable": 1,
            "actions": [
              {
                "link": "http:\/\/wiki.teamfortress.com\/scripts\/itemredirect.php?id=214&lang=en_US",
                "name": "Item Wiki Page..."
              },
              {
                "link": "steam:\/\/rungame\/440\/76561202255233023\/+tf_econ_item_preview%20M1978678923286765150A%assetid%D11684625277006472574",
                "name": "Inspect in Game..."
              }
            ],
            "name": "Strange Powerjack",
            "name_color": "CF6A32",
            "type": "Strange Sledgehammer - Kills: 0",
            "market_name": "Strange Powerjack",
            "market_hash_name": "Strange Powerjack",
            "market_actions": [
              {
                "link": "steam:\/\/rungame\/440\/76561202255233023\/+tf_econ_item_preview%20M1978678923286765150A%assetid%D11684625277006472574",
                "name": "Inspect in Game..."
              }
            ],
            "commodity": 0,
            "market_tradable_restriction": 7,
            "market_marketable_restriction": 0,
            "marketable": 1,
            "app_icon": "https:\/\/steamcdn-a.akamaihd.net\/steamcommunity\/public\/images\/apps\/440\/e3f595a92552da3d664ad00277fad2107345f743.jpg",
            "owner": 0
          }
        }
      }
    },
    "hovers": "\t\tCreateItemHoverFromContainer( g_rgAssets, 'history_row_1978678923286765150_1978678923286765151_name', 440, '2', '7708744609', 0 );\r\n\t\tCreateItemHoverFromContainer( g_rgAssets, 'history_row_1978678923286765150_1978678923286765151_image', 440, '2', '7708744609', 0 );\r\n\t",
    "results_html": "<Very large HTML string...>"
}
*/

/**
 * Asset.
 * @typedef {Object} Asset
 * @property {number} currency - Currency.
 * @property {number} amount - Amount of the asset.
 * @property {number} status - Status of the asset.
 * @property {string} original_amount - Original amount of the asset.
 * @property {string} unowned_id - Unowned ID.
 * @property {string} unowned_contextid - Unowned context ID.
 * @property {string} contextid - Context ID.
 * @property {number} appid - App ID.
 * @property {string} id - ID of the asset.
 * @property {string} classid - Class ID.
 * @property {string} instanceid - Instance ID.
 * @property {string} name - Name.
 * @property {string} market_name - Market name.
 * @property {string} market_hash_name - Market hash name.
 * @property {string} [name_color] - Name color.
 * @property {string} [background_color] - Background color.
 * @property {string} type - Type.
 * @property {string} icon_url - Icon URL.
 * @property {string} icon_url_large - Large icon URL.
 * @property {number} tradable - Whether the asset is tradable. 1 for true, 0 for false.
 * @property {number} commodity - Whether the asset is a commodity. 1 for true, 0 for false.
 * @property {Description[]} descriptions - Descriptions of the asset.
 * @property {Action[]} actions - Actions available for the asset.
 * @property {Action[]} market_actions - Actions available for the asset on the market.
 * @property {number} market_tradable_restriction - Market tradable restriction.
 * @property {number} market_marketable_restriction - Market marketable restriction.
 * @property {number} marketable - Whether the asset is marketable. 1 for true, 0 for false.
 * @property {string} app_icon - App icon URL.
 * @property {number} owner - Owner ID.
 */

/**
 * Description.
 * @typedef {Object} Description
 * @property {string} value - Value of the description.
 * @property {string} [color] - Color of the description.
 */

/**
 * Action.
 * @typedef {Object} Action
 * @property {string} link - Link for the action.
 * @property {string} name - Name of the action.
 */

/**
 * Assets.
 * @typedef {Object.<string, Object.<string, Object.<string, Asset>>>} Assets
 */

/**
 * Listings response.
 * 
 * You can find examples in "tests/fixtures/market/myhistory" at the root of this project.
 * @typedef {Object} MyHistoryResponse
 * @property {boolean} response.success - Whether the response was successful or not.
 * @property {number} [response.pagesize] - Number of listings per page.
 * @property {number} [response.total_count] - Total number of listings.
 * @property {number} [response.start] - Start of listings.
 * @property {Assets} [response.assets] - Asset descriptions.
 * @property {string} [response.results_html] - HTML results.
 * @property {string} [response.hovers] - Hover data.
 */

/**
 * Gets page of market history.
 * @param {Object} options - Parameters of request.
 * @param {Object} options - Request data.
 * @param {number} [options.count] - Number of listings to fetch.
 * @param {number} [options.start] - Start index (e.g. 100 to start after the first 100 listings).
 * @param {string} [options.l] - Language.
 * @returns {Promise<Response>} Fetch promise.
 *
 * @example
 * getListings({ count: 10, start: 50, timezone: 1 });
 */
export async function getListings(options) {
    const query = queryString(options);
    const uri = 'https://steamcommunity.com/market/myhistory?' + query;
    
    return getXHR(uri, corsParams);
}

/**
 * Gets the account history page.
 * @returns {Promise<Response>} Fetch promise.
 */
export async function getHome() {
    const uri = 'https://store.steampowered.com/';
    
    return getXHR(uri, corsParams);
}

/**
 * Gets the account history page.
 * @returns {Promise<Response>} Fetch promise.
 */
export async function getAccountHistory() {
    const uri = 'https://store.steampowered.com/account/history/';
    
    return getXHR(uri, corsParams);
}

/**
 * Gets the lowestion price.
 * @param {Object} options - Options.
 * @param {(number | string)} options.currency - ID of currency.
 * @param {(number | string)} options.appid - Appid of item.
 * @param {string} options.market_hash_name -  Market hash name of item.
 * @returns {Promise<Response>} Fetch promise.
 */
export async function getLowestPrice(options) {
    const qs = queryString(options);
    const uri = `https://steamcommunity.com/market/priceoverview/?${qs}`;
    
    return getXHR(uri, corsParams);
}

/**
 * Gets the market home page.
 * @returns {Promise<Response>} Fetch promise.
 */
export async function getMarketHome() {
    const uri = 'https://steamcommunity.com/market';
    
    return getXHR(uri, corsParams);
}

/**
 * Gets hover class info.
 * @param {string} appid - Appid of item.
 * @param {string} classid - Classid of item.
 * @param {string} instanceid - Instanceid of item.
 * @param {string} [language='english'] - Language.
 * @returns {Promise<Response>} Fetch promise.
 */
export async function getClassinfo(appid, classid, instanceid, language = 'english') {
    const classinfo = [
        appid,
        classid,
        instanceid
    ].join('/');
    const qs = queryString({
        content_only: 1,
        l: language
    });
    const uri  = `https://steamcommunity.com/economy/itemclasshover/${classinfo}?${qs}`;
    
    return getXHR(uri, corsParams);
}
