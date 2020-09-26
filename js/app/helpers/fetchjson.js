'use strict';

/**
 * Fetches and parses a JSON file.
 * @param {string} uri - Location of JSON file.
 * @returns {Promise.<Object>} Resolve when done.
 */
export async function fetchJSON(uri) {
    const response = await fetch(uri);
    
    if (!response.ok) {
        return Promise.reject(`Failed to load ${uri}: ${response.statusText}`);
    }
    
    return response.json();
}