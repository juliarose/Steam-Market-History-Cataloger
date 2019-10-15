'use strict';

/**
 * Downloads a file.
 * @param {String} name - Name of file to be saved.
 * @param {String} data - Data to be saved.
 * @returns {undefined}
 */
function download(name, data) {
    const link = document.createElement('a');
    const blob = new Blob([data], {
        type: 'octet/stream'
    });
    const url = window.URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', name);
    link.click();
}

export {download};