// Contains type definitions for models.

/**
 * @typedef {import('./currency.js').Currency} Currency
 * @typedef {import('./classes/localization.js').Localization} Localization
 * @typedef {import('./helpers/download.js').DownloadCollectionOptions} DownloadCollectionOptions
 */

/**
 * Types for each column in the model.
 * @typedef {Object.<string, (StringConstructor | BooleanConstructor | NumberConstructor | DateConstructor)>} ModelTypes
 */

/**
 * Builds the display attributes.
 * @name MakeDisplayFunction
 * @function
 * @param {Localization} locales - Localization strings.
 * @returns {DisplayOptions} Display options.
*/

/**
 * Generic class for models.
 * @typedef {Object} Displayable
 * @property {string} identifier - String to uniquely identify this model.
 * @property {string} [primary_key] - The primary key for the data set in the database.
 * @property {ModelTypes} types - Maps for defining the data type of each column.
 * @property {MakeDisplayFunction} makeDisplay - Function to build the display attributes.
 */

/**
 * Contains attributes for displaying attributes related to model.
 * @typedef {Object} DisplayOptions
 * @property {Object.<string, string>} [names] - Textual display property of each column name e.g. "appname" is mapped to "App".
 * @property {Object.<string, (string | number)>} [identifiers] - Object containing exact strings to test against for key data.
 * @property {string[]} [currency_fields] - Array of columns that are currencies.
 * @property {string[]} [boolean_fields] - Array of columns that are booleans.
 * @property {string[]} [number_fields] - Array of columns that are numbers.
 * @property {DisplayContext} [csv] - Context for displaying CSV data.
 * @property {DisplayContext} [json] - Context for displaying JSON data.
 * @property {DisplayContext} [table] - Context for displaying HTML tabular data.
 */

/**
 * @typedef {Object} DisplayContext
 * @property {string[]} [columns] - Names of each columns to display.
 * @property {Object} [column_names] - Maps for each column to get each column's name.
 * @property {Object} [sorts] - Maps columns to sort against when displaying tabular data.
 * @property {Object} [column_class] - Maps for assigning columns classes to each column when displaying tabular data.
 * @property {Function} [row_class] - Function which returns an array of class names to apply to row on specific record when displaying tabular data.
 * @property {Object} [cell_value] - Maps for assigning contents for each cell when displaying tabular data.
 * @property {Object} [events] - Maps for events to bind to each row when displaying tabular data.
 **/
