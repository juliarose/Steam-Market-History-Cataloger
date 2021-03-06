'use strict';

/**
 * Creates an XHR request.
 * @param {string} url - URL of location.
 * @param {Object} [settings={}] - Settings for request.
 * @returns {Promise} Fetch promise.
 */
export async function getXHR(url, settings = {}) {
    console.log(`${settings.method || 'GET'} %s`, url);
    
    return fetch(url, settings);
}