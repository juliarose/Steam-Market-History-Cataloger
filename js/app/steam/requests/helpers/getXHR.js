'use strict';

/**
 * Creates an XHR request.
 * @param {String} url - URL of location.
 * @param {Object} [settings={}] - Settings for request.
 * @returns {Promise} Fetch promise.
 */
function getXHR(url, settings = {}) {
    console.log(`${settings.method || 'GET'} %s`, url);
    
    return fetch(url, settings);
}

export {getXHR};