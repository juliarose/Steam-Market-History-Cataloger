import { getAccountHistory, getClassinfo as getHoverClassinfo, getMarketHome } from './requests/get.js';
import { AppError } from '../error.js';

// this stores assets that were fetched so that we do need to re-fetch them everytime
const assetCache = {};

/**
 * Steam session.
 * @typedef {Object} SteamSession
 * @property {string} steamid - Steamid64.
 * @property {string} sessionid - Sessionid.
 */

/**
 * Gets Steam session.
 * @returns {Promise<SteamSession>} Resolves with session details when done, reject on error.
 */
export async function getSteamPoweredSession() {
    function parseText(text) {
        /**
         * Converts a 32-bit account id to steamid64.
         * @param {string} accountid - Accountid to convert.
         * @returns {string} Steamid64 in string format.
         */
        function to64(accountid) {
            return (BigInt(accountid) + BigInt('76561197960265728')).toString();
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
    
    const response = await getAccountHistory();
    
    if (!response.ok) {
        throw new AppError(response.statusText);
    }
    
    const responseText = await response.text();
    const data = parseText(responseText);
    const hasData = Boolean(
        data.steamid &&
        data.sessionid
    );
    
    if (!hasData) {
        throw new AppError('No session');
    }
    
    return data;
}

/**
 * Gets class info.
 * @param {string} appid - Appid of item.
 * @param {string} classid - Classid of item.
 * @param {string} instanceid - Instanceid of item.
 * @param {string} [language='english'] - Language.
 * @returns {Promise<Object>} Resolves with asset when done, reject on error.
 */
export async function getClassinfo(appid, classid, instanceid, language = 'english') {
    function parseResponseText(text) {
        // extract the json for item with pattern...
        const match = text.match(/BuildHover\(\s+?\'economy_item_[A-z0-9]+\',\s*?(.*)\s\);/);
        
        try {
            // then parse it
            return JSON.parse(match[1].trim());
        } catch {
            return null;
        }
    }
    
    // Get the cache
    const cache = assetCache &&
        assetCache[appid] &&
        assetCache[appid][classid] &&
        assetCache[appid][classid][instanceid] &&
        assetCache[appid][classid][instanceid][language];;
    
    if (cache) {
        return Promise.resolve(cache);
    }
        
    const response = await getHoverClassinfo(appid, classid, instanceid, language);
    
    if (!response.ok) {
        throw new AppError(response.statusText);
    }
    
    const responseText = await response.text();
    const asset = parseResponseText(responseText);
    
    if (!asset) {
        throw new AppError('Failed to parse asset from response');
    }
    
    // cache it
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
    
    return asset;
}

/**
 * Verifies that we are logged in.
 * @returns {Promise<void>} Resolves when done, reject if we are not logged in or there is an error.
 */
export async function verifyLogin() {
    const response = await getMarketHome();
        
    if (!response.ok) {
        throw new AppError(response.statusText);
    }
    
    const responseText = await response.text();
    const isLoggedIn = /g_bLoggedIn = true;/.test(responseText);
    
    if (!isLoggedIn) {
        // and reject with an error that we are not logged in
        throw new AppError('Not logged in');
    }
    
    // everything is alright
    return;
}
