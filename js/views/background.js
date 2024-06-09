'use strict';

import { setBadgeText } from '../app/browser.js';
import { ListingPoller } from '../app/manager/listingpoller.js';
import { browserLocalStorage, onMessage } from '../app/browser.js';

const listingPoller = new ListingPoller();

function addListeners() {
    onMessage.addListener((request, _sender, sendResponse) => {
        switch (request.name) {
            case 'startLoading': {
                // force load
                listingPoller.resumeLoading(true);
                sendResponse();
                break;
            }
            case 'resumeLoading': {
                listingPoller.resumeLoading();
                sendResponse();
                break;
            }
            case 'clearListingCount': {
                listingPoller.clearListingCount();
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
    
    listingPoller.on('count', (count) => {
        updateCount(count);
    });
}

// updates the count on using the badge text
function updateCount(count) {
    browserLocalStorage.setItem('listingCount', count);
    
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

// ready
{
    addListeners();
    updateCount(0);
    listingPoller.start(5);
}
