'use strict';

import StreamSaver from '../../lib/StreamSaver.min.js';
import { sleep } from '../helpers/utils.js';

/**
 * Downloads a file.
 * @param {string} name - Name of file to be saved.
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

export async function downloadCollection(filename, table, collection, options) {
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
    
    if (header !== undefined) {
        writeToStream(header);
    }
    
    if (format === 'csv') {
        writeToStream(seperator);
    }
    
    function writeRecords(records, isBeginning) {
        let str = records.map(converter).join(seperator);
        
        console.log(str);
        
        if (!isBeginning) {
            str = seperator + str;
        }
        
        writeToStream(str);
    }
    
    await downloadSorted(table, collection, {
        limit,
        order,
        direction
    });
    
    if (footer !== undefined) {
        writeToStream(footer);
    }
    
    writer.close();
}