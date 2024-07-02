// @ts-check

// browser utilities

const browser = chrome;
const browserAction = browser.action;

export const tabs = browser.tabs;
export const storage = browser.storage.sync || browser.storage.local;
export const onMessage = browser.runtime.onMessage;

/**
 * Sets browser icon.
 * @param {Object} details - Details.
 * @param {function(): void} [callback=function(){}] - Callback function.
 */
export function setIcon(details, callback = function() {}) {
    browserAction.setIcon(details, callback);
}

/**
 * Sets browser badge text.
 * @param {Object} details - Details.
 * @param {function(): void} [callback=function(){}] - Callback function.
 */
export function setBadgeText(details, callback = function() {}) {
    browserAction.setBadgeText(details, callback);
}

/**
 * Gets browser badge text.
 * @param {Object} details - Details.
 * @param {function(): void} [callback=function(){}] - Callback function.
 */
export function getBadgeText(details, callback = function() {}) {
    browserAction.getBadgeText(details, callback);
}

/**
 * Sends a runtime message.
 * @param {Object} details - Details.
 * @returns {Promise<any>} Resolves with message.
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
    return browser.runtime.getURL(url);
}
