'use strict';

import StreamSaver from '../../lib/StreamSaver.min.js';
import { sleep } from '../helpers/utils.js';

/**
 * Downloads a file.
 * @param {string} filename - Name of file to be saved.
 * @param {string} data - Data to be saved.
 * @returns {undefined}
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
 * Downloads a collection as a stream.
 * @param {string} filename - Name of file to be saved.
 * @param {object} table - Table containing collection.
 * @param {object} collection - Collection to save.
 * @param {object} options - Options.
 * @param {string} options.header - Header for file.
 * @param {string} options.footer - Footer for file.
 * @param {string} options.format - Format of file.
 * @param {function} options.converter - Function for converting records to strings.
 * @param {string} options.order - Column for order.
 * @param {number} options.direction - Direction of order.
 * @param {number} options.limit - Chunk size limit.
 * @returns {Promise.<void>} Resolves when done.
 */
export async function downloadCollection(filename, table, collection, options) {
    async function downloadSorted(table, collection, options) {
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
            order,
            // todo - use this to change the direction items are ordered in
            direction
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

    async function writeToStream(str) {
        // Add the string to the stream
        writer.write(encoder.encode(str));
    }
    
    function writeRecords(records, isBeginning) {
        let str = records.map(converter).join(seperator);
        
        if (!isBeginning) {
            str = seperator + str;
        }
        
        writeToStream(str);
    }
    
    function beforeUnload(e) {
        e.preventDefault();
        e.returnValue = 'Download in progress. Are you sure you want to exit?';
    }
    
    function unload(e) {
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