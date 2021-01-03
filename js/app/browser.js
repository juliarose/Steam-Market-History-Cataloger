'use strict';

// browser utilities

const browser = chrome;
export const browserLocalStorage = localStorage;
export const tabs = browser.tabs;
export const storage = browser.storage.sync || browser.storage.local;
export const onMessage = browser.runtime.onMessage;

/**
 * Sets browser icon.
 * @param {Object} details - Details.
 * @param {Function} [callback=function(){}] - Callback function.
 * @returns {undefined}
 */
export function setIcon(details, callback = function() {}) {
    browser.browserAction.setIcon(details, callback);
}

/**
 * Sets browser badge text.
 * @param {Object} details - Details.
 * @param {Function} [callback=function(){}] - Callback function.
 * @returns {undefined}
 */
export function setBadgeText(details, callback = function() {}) {
    browser.browserAction.setBadgeText(details, callback);
}

/**
 * Gets browser badge text.
 * @param {Object} details - Details.
 * @param {Function} [callback=function(){}] - Callback function.
 * @returns {undefined}
 */
export function getBadgeText(details, callback = function() {}) {
    browser.browserAction.getBadgeText({}, callback);
}

/**
 * Sends a runtime message.
 * @param {Object} details - Details.
 * @returns {Promise.<any>} Resolves with message.
 */
export async function sendMessage(details) {
    return new Promise((resolve) => {
        browser.runtime.sendMessage(details, resolve);
    });
}

/**
 * Gets a URL of an extension resource.
 * @param {string} url - URL of resource relative to extension's root.
 * @returns {string} Absolute extension URL.
 */
export function getExtensionURL(url) {
    return browser.extension.getURL(url);
}