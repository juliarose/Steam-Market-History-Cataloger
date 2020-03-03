'use strict';

import { queryString } from '../../helpers/utils.js';
import { getXHR } from './helpers/getXHR.js';

/**
 * GET XHR requests for Steam.
 *
 * @namespace Steam.requests.get
 * @memberOf Steam.requests
 */
const get = {
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
     * Gets page of market history.
     * @memberOf Steam.requests.get
     * @param {Object} options - Parameters of request.
     * @param {Object} options.data - Request data.
     * @param {number} options.data.count - Number of listings to fetch.
     * @param {number} options.data.start - Start index (e.g. 100 to start after the first 100 listings).
     * @returns {Promise} Fetch promise.
     *
     * @example
     * Steam.requests.get.listings({ count: 10, start: 50, timezone: 1 });
     */
    listings: function(options) {
        let query = queryString(options);
        let uri = 'https://steamcommunity.com/market/myhistory?' + query;
        let params = {
            method: 'GET',
            credentials: 'include',
            mode: 'cors',
            referrer: 'no-referrer'
        };
        
        return getXHR(uri, params);
    },
    /**
     * Gets the account history page.
     * @memberOf Steam.requests.get
     * @returns {Promise} Fetch promise.
     */
    home: function() {
        let uri = 'https://store.steampowered.com/';
        let params = {
            method: 'GET',
            credentials: 'include',
            mode: 'cors',
            referrer: 'no-referrer'
        };
        
        return getXHR(uri, params);
    },
    /**
     * Gets the account history page.
     * @memberOf Steam.requests.get
     * @returns {Promise} Fetch promise.
     */
    accountHistory: function() {
        let uri = 'https://store.steampowered.com/account/history/';
        let params = {
            method: 'GET',
            credentials: 'include',
            mode: 'cors',
            referrer: 'no-referrer'
        };
        
        return getXHR(uri, params);
    },
    /**
     * Gets the lowestion price.
     * @memberOf Steam.requests.get
     * @param {Object} options - Options.
     * @param {(number|string)} options.currency - ID of currency.
     * @param {(number|string)} options.appid - Appid of item.
     * @param {string} options.market_hash_name -  Market hash name of item.
     * @returns {Promise} Fetch promise.
     */
    lowestPrice: function(options) {
        let qs = queryString(options);
        let uri = `https://steamcommunity.com/market/priceoverview/?${qs}`;
        let params = {
            method: 'GET',
            credentials: 'include',
            mode: 'cors',
            referrer: 'no-referrer'
        };
        
        return getXHR(uri, params);
    },
    /**
     * Gets the market home page.
     * @memberOf Steam.requests.get
     * @returns {Promise} Fetch promise.
     */
    marketHome: function() {
        let uri = 'https://steamcommunity.com/market';
        let params = {
            method: 'GET',
            credentials: 'include',
            mode: 'cors',
            referrer: 'no-referrer'
        };
        
        return getXHR(uri, params);
    },
    /**
     * Gets hover class info.
     * @memberOf Steam.requests.get
     * @param {string} appid - Appid of item.
     * @param {string} classid - Classid of item.
     * @param {string} instanceid - Instanceid of item.
     * @param {string} [language='english'] - Language.
     * @returns {Promise} Fetch promise.
     */
    classinfo: function(appid, classid, instanceid, language = 'english') {
        let classinfo = [
            appid,
            classid,
            instanceid
        ].join('/');
        let qs = queryString({
            content_only: 1,
            l: language
        });
        let uri  = `https://steamcommunity.com/economy/itemclasshover/${classinfo}?${qs}`;
        let params = {
            method: 'GET',
            credentials: 'include',
            mode: 'cors',
            referrer: 'no-referrer'
        };
        
        return getXHR(uri, params);
    }
};

export { get };