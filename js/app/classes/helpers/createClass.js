// @ts-check

/**
 * @typedef {import('../../currency.js').Currency} Currency
 * @typedef {import('./../Localization.js').Localization} Localization
 * @typedef {import('../../helpers/download.js').DownloadCollectionOptions} DownloadCollectionOptions
 */

/**
 * Types for each column in the model.
 * @typedef {Object.<string, (StringConstructor | BooleanConstructor | NumberConstructor | DateConstructor)>} DisplayableTypes
 */

/**
 * Contains attributes for streaming records from the database for download.
 * @typedef {Object} StreamDisplayOptions
 * @property {string} order - The column to order the records by.
 * @property {number} direction - Direction of order. 1 for descending, -1 for ascending.
 */

/**
 * Contains attributes for displaying attributes related to model.
 * @typedef {Object} DisplayOptions
 * @property {Object.<string, string>} [names] - Textual display property of each column name e.g. "appname" is mapped to "App".
 * @property {Object.<string, Object.<string, (string | number)>>} [identifiers] - Object containing exact strings to test against for key data.
 * @property {StreamDisplayOptions} [stream] - Options for streaming records from the database for download.
 * @property {string[]} [currency_fields] - Array of columns that are currencies.
 * @property {string[]} [boolean_fields] - Array of columns that are booleans.
 * @property {string[]} [number_fields] - Array of columns that are numbers.
 * @property {DisplayContext} [csv] - Context for displaying CSV data.
 * @property {DisplayContext} [table] - Context for displaying HTML tabular data.
 */

/**
 * Function for building a cell value.
 * @typedef {function((string | number | boolean | Date | null | undefined), Object): string} CellValueFunction
 */

/**
 * Function for binding an event.
 * @typedef {function(Event, Object): void} EventFunction
 */

/**
 * @typedef {Object} DisplayContext
 * @property {string[]} [columns] - Names of each columns to display.
 * @property {Object.<string, string>} [column_names] - Maps for each column to get each column's name.
 * @property {Object.<string, string>} [sorts] - Maps columns to sort against when displaying tabular data.
 * @property {Object.<string, string[]>} [column_class] - Maps for assigning columns classes to each column when displaying tabular data.
 * @property {Function} [row_class] - Function which returns an array of class names to apply to row on specific record when displaying tabular data.
 * @property {Object.<string, CellValueFunction>} [cell_value] - Maps for assigning contents for each cell when displaying tabular data.
 * @property {Object.<string, EventFunction>} [events] - Maps for events to bind to each row when displaying tabular data.
 **/

/**
 * Generic class for models.
 * @typedef {Object} Displayable
 * @property {string} identifier - String to uniquely identify this model.
 * @property {string} [primary_key] - The primary key for the data set in the database.
 * @property {DisplayableTypes} types - Maps for defining the data type of each column.
 * @property {function(Localization): DisplayOptions} makeDisplay - Function to build the display attributes.
 */

/**
 * This actually does nothing but VSCode seems to only recognize the typedefs in the file if it is 
 * imported somewhere in the project?
 */
export function createClass() {
    return;
}
