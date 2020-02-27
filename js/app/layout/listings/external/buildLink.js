'use strict';

/**
 * Builds an external link.
 * @param {Object} data - Data for link.
 * @param {String} data.url - URL for link.
 * @param {String} data.title - Text for link.
 * @param {Boolean} [data.placeholder] - Whether this is a placeholder link or not.
 * @returns {HTMLElement} Element object.
 */
function buildLink(data) {
    let buttonEl = document.createElement('div');
    let linkEl = document.createElement('a');
    
    linkEl.setAttribute('href', data.url);
    linkEl.setAttribute('target', '_blank');
    linkEl.setAttribute('rel', 'noreferrer');
    linkEl.append(buttonEl);
    
    if (data.placeholder) {
        linkEl.classList.add('placeholder');
    }
    
    buttonEl.classList.add('button');
    buttonEl.textContent = data.title;
    
    return linkEl;
}

export { buildLink };