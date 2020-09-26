'use strict';

import { EventEmitter } from '../../../lib/eventemitter.js';
import { Settings } from './mixins/settings.js';

/**
 * Creates a LocalStorageManager.
 * @param {Object} [structure={}] - LocalStorageManager structure.
 * @returns {LocalStorageManager} A new Manager.
 */
export function createLocalStorageManager(structure = {}) {
    /**
     * Manages a set of data that needs to be stored persistently.
     *
     * Provides an interface for getting/setting data from the browser's
     * localStorage and Inherits from EventEmitter's prototype.
     * @class LocalStorageManager
     * @implements {Settings}
     * @implements {EventEmitter}
     */
    return Object.assign(
        {},
        Settings,
        EventEmitter.prototype,
        structure
    );
}