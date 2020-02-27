'use strict';

/**
 * Generic class for models.
 * @class Model
 * @property {Object} types - Maps for defining the data type of each column.
 * @property {String} identifier - String to uniquely identify this model.
 * @property {String} [primary_key] - The primary key for the set data set in the database.
 * @property {DisplayObject} [display] - Display attributes. Define a "makeDisplay" function on model that returns a DisplayContext for building the attributes.
 */

/**
 * Contains attributes for displaying attributes related to model.
 * @typedef {Object} DisplayOptions
 * @property {Object} [names] - Textual display property of each column name e.g. "appname" is mapped to "App".
 * @property {Object} [identifiers] - Object containing exact strings to test against for key data.
 * @property {Array} [currency_fields] - Array of columns that are currencies.
 * @property {Array} [boolean_fields] - Array of columns that are booleans.
 * @property {Array} [number_fields] - Array of columns that are numbers.
 * @property {DisplayContext} [csv] - Context for displaying CSV data.
 * @property {DisplayContext} [json] - Context for displaying JSON data.
 * @property {DisplayContext} [table] - Context for displaying HTML tabular data.
 */

/**
 * @typedef {Object} DisplayContext
 * @property {String[]} [columns] - Names of each columns to display.
 * Aproperty {Object} [column_names] - Maps for each column to get each column's name.
 * @property {Object} [sorts] - Maps columns to sort against when displaying tabular data.
 * @property {Object} [column_class] - Maps for assigning columns classes to each column when displaying tabular data.
 * @property {Function} [row_class] - Function which returns an array of class names to apply to row on specific record when displaying tabular data.
 * @property {Object} [cell_value] - Maps for assigning contents for each cell when displaying tabular data.
 * @property {Object} [events] - Maps for events to bind to each row when displaying tabular data.
 **/

/**
 * Creates a new class.
 * @param {Object} options - Class options.
 * @param {String} options.identifier - A string to name the data set.
 * @param {Object} options.types - Maps defining the types for each column.
 * @param {String} [options.primary_key] - For classes used by the database, the primary key for the set.
 * @returns {Model} Class constructor object.
 */
function createClass({ identifier, types, primary_key }) {
    const Class = Dexie.defineClass(types);

    Class.identifier = 'listings';
    Class.types = types;
    Class.display = {};
    
    if (primary_key !== undefined) {
        Class.primary_key = primary_key;
    }
    
    return Class;
}

export { createClass };