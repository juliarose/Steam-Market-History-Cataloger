import 'fake-indexeddb/auto';
import path from 'path';
import util from 'util';
import fs from 'fs';
import chrome from 'chrome-mock';
import Dexie from 'dexie';
import jestFetch from 'jest-fetch-mock';

const rootPath = path.join(__dirname, '..');
const promisify = util.promisify;
const readFile = promisify(fs.readFile);

// fake fetch with local files and http requests
const fetch = async function(url) {
    const fetchLocal = async (url) => {
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

if (!chrome.runtime) {
    chrome.runtime = {};
}

chrome.runtime.getURL = function(url) {
    // return the absolute url of this resource
    return path.join(rootPath, url);
};

const { performance } = require('perf_hooks');

// fake AbortController needed for Dexie
class AbortController {
    constructor() {
        
    }
    
    abort() {
        
    }
}

global.AbortController = AbortController;
global.fetch = fetch;
global.performance = performance;
global.Dexie = Dexie;
global.chrome = chrome;

require('jsdom-global')();

global.DOMParser = window.DOMParser;
