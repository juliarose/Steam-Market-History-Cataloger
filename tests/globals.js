require('fake-indexeddb/auto');

const path = require('path');
const util = require('util');
const fs = require('fs');
const chrome = require('chrome-mock');
const Dexie = require('dexie');
const jestFetch = require('jest-fetch-mock');

const rootPath = path.join(__dirname, '..');
const promisify = util.promisify;
const readFile = promisify(fs.readFile);

// fake fetch with local files and http requests
const fetch = function(url) {
    const fetchLocal = (url) => {
        // create a fake fetch response object from data
        const createFakeResponse = (data, status = 200) => {
            return {
                status,
                data,
                ok: true,
                json() {
                    return Promise.resolve(JSON.parse(data));
                },
            };
        };
        
        return readFile(url, 'utf8')
            .then(createFakeResponse);
    };
    // check whether the url appears to be for a local file
    const isLocal = /^\//.test(url);
    // pick fetch function
    const fetch = isLocal ? fetchLocal : jestFetch;
    
    return fetch(url);
};

if (!chrome.extension) {
    chrome.extension = {
        getURL: function(url) {
            // return the absolute url of this resource
            return path.join(rootPath, url);
        }
    };
}

global.fetch = fetch;
global.Dexie = Dexie;
global.chrome = chrome;

require('jsdom-global')();

global.DOMParser = window.DOMParser;