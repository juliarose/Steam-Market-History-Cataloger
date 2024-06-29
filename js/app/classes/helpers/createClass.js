import { Dexie } from '../../dexie.js';

/**
 * @typedef {import('../base.js').Displayable} Displayable
 */

/**
 * Creates a new class.
 * @class
 * @param {Object} types - Maps defining the types for each column.
 * @returns {Displayable} Class constructor object.
 */
export function createClass(types) {
    return Dexie.defineClass(types);
}
