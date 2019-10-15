'use strict';

// browser utilities

const browser = chrome;
const tabs = browser.tabs;
const browserLocalStorage = localStorage;
const storage = browser.storage.sync || browser.storage.local;
const onMessage = browser.runtime.onMessage;

/**
 * Set browser icon.
 * @param {Object} details - Details.
 * @param {Function} [callback=function(){}] - Callback function.
 * @returns {undefined}
 */
function setIcon(details, callback = function() {}) {
    browser.browserAction.setIcon(details, callback);
}

/**
 * Set browser badge text.
 * @param {Object} details - Details.
 * @param {Function} [callback=function(){}] - Callback function.
 * @returns {undefined}
 */
function setBadgeText(details, callback = function() {}) {
    browser.browserAction.setBadgeText(details, callback);
}

/**
 * Get browser badge text.
 * @param {Object} details - Details.
 * @param {Function} [callback=function(){}] - Callback function.
 * @returns {undefined}
 */
function getBadgeText(details, callback = function() {}) {
    browser.browserAction.getBadgeText({}, callback);
}

/**
 * Send a runtime message.
 * @param {Object} details - Details.
 * @param {Function} [callback=function(){}] - Callback function.
 * @returns {undefined}
 */
function sendMessage(details, callback = function() {}) {
    browser.runtime.sendMessage(details, callback);
}

/**
 * Get a URL of an extension resource.
 * @param {String} url - URL of resource relative to extension's root.
 * @returns {String} Absolute extension URL.
 */
function getExtensionURL(url) {
    return browser.extension.getURL(url);
}

export {
    tabs,
    browserLocalStorage,
    storage,
    onMessage,
    sendMessage,
    setIcon,
    setBadgeText,
    getBadgeText,
    getExtensionURL
};