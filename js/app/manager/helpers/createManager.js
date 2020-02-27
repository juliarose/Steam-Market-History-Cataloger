'use strict';

import { EventEmitter } from '../../../lib/eventemitter.js';
import { Settings } from './mixins/settings.js';

/**
 * Creates a Manager.
 * @returns {Manager} A new Manager.
 */
function createManager(structure = {}) {
    /**
     * Manages a set of data that needs to be stored persistently.
     *
     * Provides an interface for getting/setting data from the browser's
     * localStorage and Inherits from EventEmitter's prototype.
     * @class Manager
     * @implements {Settings}
     */
    return Object.assign(
        {},
        Settings,
        EventEmitter.prototype,
        structure
    );
}

export { createManager };