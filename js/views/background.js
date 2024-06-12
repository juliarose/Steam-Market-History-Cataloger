'use strict';

import { setBadgeText } from '../app/browser.js';
import { ListingWorker } from '../app/manager/listingworker.js';
import { onMessage } from '../app/browser.js';

const LOAD_LISTINGS_ALARM_KEY = 'load-listings';
const listingWorker = new ListingWorker();

function addListeners() {
    onMessage.addListener(({ name }, _sender, sendResponse) => {
        switch (name) {
            case 'startLoading': {
                // force load
                load(true);
                sendResponse();
                break;
            }
            case 'resumeLoading': {
                load();
                sendResponse();
                break;
            }
            case 'clearListingCount': {
                listingWorker.clearListingCount();
                updateCount(0);
                sendResponse();
                break;
            }
            case 'getListingIndex': {
                sendResponse();
                break;
            }
            default: {
                sendResponse();
            }
        }
    });
    
    chrome.runtime.onInstalled.addListener(() => {
        // this will load the initial data it needs
        chrome.tabs.create({ url: 'https://steamcommunity.com/market?installation=1' }, () => {
            
        });
    });
    
    listingWorker.on('count', (count) => {
        updateCount(count);
    });
    
    chrome.alarms.onAlarm.addListener((alarm) => {
        switch (alarm.name) {
            case LOAD_LISTINGS_ALARM_KEY: {
                load();
                break;
            }
            default: {
                console.warn('Unknown alarm:', alarm.name);
            }
        }
    });
}

// updates the count on using the badge text
function updateCount(count) {
    if (count >= 1000) {
        // truncate to fit
        count = '999+';
    } else if (count === 0) {
        count = '';
    } else {
        // must be string
        count = count.toString();
    }
    
    setBadgeText({
        text: count
    });
}

async function checkAlarmState() {
    const alarm = await chrome.alarms.get(LOAD_LISTINGS_ALARM_KEY);
    
    if (!alarm) {
        // 1 minute - don't call it immediately
        startAlarm(1);
    }
}

async function startAlarm(delayInMinutes) {
    await chrome.alarms.create(LOAD_LISTINGS_ALARM_KEY, {
        delayInMinutes
    });
}

async function load(force = false) {
    if (listingWorker.isLoading) {
        // do nothing
        return;
    }
    
    async function next() {
        const pollIntervalMinutes = await listingWorker.getPollIntervalMinutes();
        
        await startAlarm(pollIntervalMinutes);
    }
    
    listingWorker.start(force)
        .then(next)
        .catch((err) => {
            console.warn('Error getting listings:', err);
            next();
        });
}

// ready
{
    addListeners();
    updateCount(0);
    checkAlarmState();
}
