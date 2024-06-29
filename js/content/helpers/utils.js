
// utility functions used in content scripts

/**
 * Pick keys from an object.
 * @param {Object} object - Object to pick values from.
 * @param {string[]} keys - Array of keys to pick.
 * @returns {Object} Object with picked keys.
 */
function pickKeys(object, keys) {
    let result = {};
    
    for (let i = 0; i < keys.length; i++) {
        result[keys[i]] = object[keys[i]];
    }
    
    return result;
}

/**
 * Get a cookie's value.
 * @param {string} name - Name of cookie.
 * @returns {(string|null)} Value of cookie.
 */
function getCookie(name) {
    // unpack pairs
    const pairs = document.cookie.split(/;\s*/);
    const header = `${name}=`;
    
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        
        if (pair.indexOf(header) === 0) {
            return pair.substring(header.length, pair.length);
        }
    }
    
    return null;
}

/**
 * Collect info from page scripts.
 * @param {Object} obj - Object with functions to extract info.
 * @returns {Object} Object with values mapped from functions.
 */
function collectInfo(obj) {
    const isEmpty = (value) => {
        return Boolean(
            value === '' ||
            value == null
        );
    };
    const keys = Object.keys(obj);
    const scripts = Array.from(document.body.getElementsByTagName('script'));
    
    // loop over scripts
    // adding values collect from each script
    return scripts.reduce((result, script) => {
        const content = script.textContent;
        
        keys.forEach((key) => {
            const value = obj[key](content);
            
            if (!isEmpty(value)) {
                // remove the key
                keys.splice(keys.indexOf(key), 1);
                result[key] = value;
            }
        });
        
        return result;
    }, {});
}

/**
 * Get and set settings from chrome.storage.
 * @namespace Settings
 */
const Settings = (function() {
    const storage = chrome.storage.sync || chrome.storage.local;
    
    /**
     * Store settings.
     * @memberOf Settings
     * @param {string} key - Settings key.
     * @param {Object} data - Data to save.
     * @returns {Promise<void>} Promise as a callback.
     */ 
    async function store(key, data) {
        return new Promise((resolve) => {
            let obj = {};
            
            obj[key] = data;
            storage.set(obj, resolve);
        });
    }
    
    /**
     * Get settings.
     * @memberOf Settings
     * @param {string} key - Settings key.
     * @param {boolean} [noWrapper] - Whether data should not be wrapped by key.
     * @returns {Promise<Object>} Promise with settings.
     */ 
    async function get(key, noWrapper) {
        return new Promise((resolve) => {
            storage.get(key, (settings) => {
                if (noWrapper && settings) {
                    settings = settings[key];
                }
                
                resolve(settings || {});
            });
        });
    }
    
    /**
     * Add to settings.
     * @memberOf Settings
     * @param {string} key - Settings key.
     * @param {Object} data - Data to add.
     * @returns {Promise<Object>} Promise with settings.
     */ 
    async function addTo(key, data) {
        return get(key, true)
            .then((settings) => {
                settings = Object.assign(settings, data);
                
                return store(key, settings);
            });
    }
    
    return {
        get,
        store,
        addTo
    };
}());