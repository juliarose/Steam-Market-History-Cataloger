// @ts-check

import StreamSaver from '../../lib/StreamSaver.js';

/**
 * Downloads a file.
 * @param {string} filename - Name of file to be saved.
 * @param {string} data - Data to be saved.
 */
export function download(filename, data) {
    const link = document.createElement('a');
    const blob = new Blob([data], {
        type: 'octet/stream'
    });
    const url = window.URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.click();
}

/**
 * Options for downloading a collection.
 * @typedef {Object} DownloadCollectionOptions
 * @property {string} header - Header for file.
 * @property {string} [footer] - Footer for file.
 * @property {string} format - Format of file.
 * @property {function(any): string} converter - Function for converting records to strings.
 * @property {string} [seperator] - Seperator for records.
 * @property {string} order - Column for order.
 * @property {number} direction - Direction of order.
 * @property {number} limit - Chunk size limit.
 */

/**
 * Options for downloading a sorted collection.
 * @typedef {Object} DownloadSortedOptions
 * @property {string} order - Column for order.
 * @property {number} limit - Chunk size limit.
 * @property {number} direction - Direction of order. 1 for descending, -1 for ascending.
 */

/**
 * Downloads a collection as a stream.
 * @param {string} filename - Name of file to be saved.
 * @param {Object} table - Table containing collection.
 * @param {Object} collection - Collection to save.
 * @param {DownloadCollectionOptions} options - Options.
 * @returns {Promise<void>} Resolves when done.
 */
export async function downloadCollection(filename, table, collection, options) {
    /**
     * Downloads a collection sorted by a column.
     * @param {Object} table - Table containing collection.
     * @param {Object} collection - Collection to save.
     * @param {DownloadSortedOptions} options - Options.
     * @returns 
     */
    async function downloadSorted(table, collection, options) {
        /**
         * Gets the next page of records, writing them to the stream as they are retrieved.
         * @param {Object} lastEntry - The last entry in the array of records.
         * @returns {Promise<void>} Resolves when done.
         */
        async function getNextPage(lastEntry) {
            const pageKeys = [];
            
            await table
                .where(order).below(lastEntry[order])
                .reverse()
                .until(() => pageKeys.length === limit)
                .eachPrimaryKey((id) => {
                    if (primaryKeySet.has(id)) {
                        pageKeys.push(id);
                    }
                });
            
            const records = await Promise.all(pageKeys.map((id) => {
                return table.get(id);
            }));
            
            writeRecords(records);
            
            if (records.length < limit) {
                return;
            }
            
            return getNextPage(records[records.length - 1]);
        }
        
        const {
            limit,
            order
        } = options;
        const primaryKeySet = new Set(await collection.primaryKeys());
        const pageKeys = [];
        
        await table
            .orderBy(order)
            .reverse()
            .until(() => pageKeys.length === limit)
            .eachPrimaryKey((id) => {
                if (primaryKeySet.has(id)) {
                    pageKeys.push(id);
                }
            });
        
        const records = await Promise.all(pageKeys.map((id) => {
            return table.get(id);
        }));
        
        writeRecords(records, true);
        
        if (records.length < limit) {
            return;
        }
        
        return getNextPage(records[records.length - 1]);
    }
    
    /**
     * Writes to the stream.
     * @param {string} str 
     */
    async function writeToStream(str) {
        // Add the string to the stream
        writer.write(encoder.encode(str));
    }
    
    /**
     * Writes records to the stream.
     * @param {Object[]} records - Records to write.
     * @param {boolean} [isBeginning] - Whether this is the beginning of the file.
     */
    function writeRecords(records, isBeginning) {
        let str = records.map(converter).join(seperator);
        
        if (!isBeginning) {
            str = seperator + str;
        }
        
        writeToStream(str);
    }
    
    /**
     * Event fired before the page is unloaded.
     * @param {Event} e - Event.
     * @returns {string} The message to display.
     */
    function beforeUnload(e) {
        e.preventDefault();
        return 'Download in progress. Are you sure you want to exit?';
    }
    
    function unload() {
        // close the stream
        writer.close();
    }
    
    const {
        header,
        footer,
        format,
        converter,
        order,
        direction,
        limit
    } = options;
    // @ts-ignore
    // The docs for StreamSaver have the third argument as deprecated and 2nd argument as optional.
    const fileStream = StreamSaver.createWriteStream(filename);
    const writer = fileStream.getWriter();
    const encoder = new TextEncoder();
    const seperator = (
        format === 'json' ?
            ',' :
            '\n'
    );
    
    // we want to alert the user if they close the page during a download in progress
    window.addEventListener('beforeunload', beforeUnload);
    window.addEventListener('unload', unload);
    
    if (header !== undefined) {
        writeToStream(header);
    }
    
    if (format === 'csv') {
        writeToStream(seperator);
    }
    
    await downloadSorted(table, collection, {
        limit,
        order,
        direction
    });
    
    if (footer !== undefined) {
        writeToStream(footer);
    }
    
    // remove the listeners
    window.removeEventListener('beforeunload', beforeUnload);
    window.removeEventListener('unload', unload);
    writer.close();
}
