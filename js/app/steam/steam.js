'use strict';

import {requests} from './requests/requests.js';

let assetCache = {};

const Steam = {
    requests: requests,
    getSteamPoweredSession: function() {
        function parseText(text) {
            /**
             * Converts a 32-bit account id to steamid64.
             * @param {String} accountid - Accountid to convert.
             * @returns {String} Steamid64 in string format.
             */
            function to64(accountid) {
                return (BigInt(accountid) + BigInt(76561197960265728)).toString();
            }
            
            const sessionid = (text.match(/g_sessionID\s*=\s*"([A-z0-9]+)";$/m) || [])[1];
            const accountid = (text.match(/g_AccountID\s*=\s*(\d+);$/m) || [])[1];
            const steamid = (
                accountid &&
                to64(accountid)
            );
            
            return {
                steamid,
                sessionid
            };
        }
        
        return Steam.requests.get.accountHistory()
            .then((response) => {
                if (response.ok) {
                    return response.text();
                } else {
                    return Promise.reject(response.statusText || 'Bad response');
                }
            })
            .then((text) => {
                const data = parseText(text);
                const hasData = Boolean(
                    data.steamid &&
                    data.sessionid
                );
                
                if (hasData) {
                    return data;
                } else {
                    return Promise.reject('No session');
                }
            });
    },
    /**
     * Gets class info.
     * @param {String} appid - Appid of item.
     * @param {String} classid - Classid of item.
     * @param {String} instanceid - Instanceid of item.
     * @param {String} [language='english'] - Language.
     * @returns {Promise.<Object>} Resolve with asset when done, reject on error.
     */
    getClassinfo: function(appid, classid, instanceid, language = 'english') {
        function getCache() {
            // we're making pyramids here
            return (
                assetCache &&
                assetCache[appid] &&
                assetCache[appid][classid] &&
                assetCache[appid][classid][instanceid] &&
                assetCache[appid][classid][instanceid][language]
            );
        }
        
        function parseResponseText(text) {
            // extract the json for item with pattern...
            const match = text.match(/BuildHover\(\s+?\'economy_item_[A-z0-9]+\',\s*?(.*)\s\);/);
            
            try {
                // then parse it
                return JSON.parse(match[1].trim());
            } catch (e) {
                return null;
            }
        }
        
        function cacheAsset(asset) {
            // build the object if it does not exist
            if (!assetCache[appid]) {
                assetCache[appid] = {};
            }
            
            if (!assetCache[appid][classid]) {
                assetCache[appid][classid] = {};
            }
            
            if (!assetCache[appid][classid][instanceid]) {
                assetCache[appid][classid][instanceid] = {};
            }
            
            // add the asset to the cache
            assetCache[appid][classid][instanceid][language] = asset;
        }
        
        const cache = getCache();
        
        if (cache) {
            return Promise.resolve(cache);
        }
            
        return Steam.requests.get.classinfo(appid, classid, instanceid, language)
            .then((response) => {
                if (response.ok) {
                    return response.text();
                } else {
                    return Promise.reject(response.statusText);
                }
            })
            .then((text) => {
                const asset = parseResponseText(text);
                
                if (asset) {
                    // cache it
                    cacheAsset(asset);
                    
                    return asset;
                } else {
                    return Promise.reject('Failed to parse asset from response');
                }
            });
    }
};

export {Steam};