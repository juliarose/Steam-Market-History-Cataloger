import { AppError } from '../error.js';

/**
 * Fetches and parses a JSON file.
 * @param {string} uri - Location of JSON file.
 * @returns {Promise<Object>} Resolves when done.
 */
export async function fetchJSON(uri) {
    const response = await fetch(uri);
    
    if (!response.ok) {
        throw new AppError(`Failed to load ${uri}: ${response.statusText}`);
    }
    
    return response.json();
}
