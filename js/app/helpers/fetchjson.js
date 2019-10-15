'use strict';

/**
 * Fetches and parses a JSON file.
 * @param {String} uri - Location of JSON file.
 * @returns {Promise.<Object>} Resolve when done.
 */
function fetchJSON(uri) {
    return fetch(uri)
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(`Failed to load ${uri}: ${response.statusText}`);
            }
        });
}

export {fetchJSON};