'use strict';

import { requests } from './requests/requests.js';

// this stores assets that were fetched so that we do need to re-fetch them everytime
const assetCache = {};

export const Steam = {
    requests,
    getSteamPoweredSession: async function() {
        function parseText(text) {
            /**
             * Converts a 32-bit account id to steamid64.
             * @param {string} accountid - Accountid to convert.
             * @returns {string} Steamid64 in string format.
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
        
        const response = await Steam.requests.get.accountHistory();
        
        if (!response.ok) {
            return Promise.reject(response.statusText);
        }
        
        const responseText = await response.text();
        const data = parseText(responseText);
        const hasData = Boolean(
            data.steamid &&
            data.sessionid
        );
        
        if (!hasData) {
            return Promise.reject('No session');
        }
        
        return data;
    },
    /**
     * Gets class info.
     * @param {string} appid - Appid of item.
     * @param {string} classid - Classid of item.
     * @param {string} instanceid - Instanceid of item.
     * @param {string} [language='english'] - Language.
     * @returns {Promise.<Object>} Resolve with asset when done, reject on error.
     */
    getClassinfo: async function(appid, classid, instanceid, language = 'english') {
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
            
        const response = await Steam.requests.get.classinfo(appid, classid, instanceid, language);
        
        if (!response.ok) {
            return Promise.reject(response.statusText);
        }
        
        const responseText = await response.text();
        const asset = parseResponseText(responseText);
        
        if (!asset) {
            return Promise.reject('Failed to parse asset from response');
        }
        
        // cache it
        cacheAsset(asset);
        
        return asset;
    }
};