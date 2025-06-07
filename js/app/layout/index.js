import { ERROR_TYPE } from '../error.js';

/**
 * Methods for rendering the layout of the page.
 * @module Layout
 */

import { sendMessage } from '../browser.js';
// importing this file enables dropdowns on page
import '../helpers/dropdown.js'; 

export * as listings from './listings/index.js';
import { escapeHTML } from '../helpers/utils.js';
export { buildTable } from './buildTable.js';
export { tooltip } from './tooltip.js';
export { getLayoutOptions } from './getLayoutOptions.js';

/**
 * Sends a message to clear the listing count.
 */
function clearListingCount() {
    sendMessage({
        name: 'clearListingCount'
    });
}

/**
 * Creates a spinner element.
 * @param {string} id - ID for element.
 * @param {string} className - Class name for element.
 * @param {string} spinnerClassName - Class name for spinner element.
 * @returns {HTMLElement} An element containing a spinner.
 */
export function createSpinner(id, className, spinnerClassName) {
    const loaderEl = document.createElement('div');
    
    loaderEl.setAttribute('id', id);
    loaderEl.setAttribute('class', className);
    loaderEl.innerHTML = `
        <div class="${spinnerClassName}">
            <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
        </div>
    `;
    
    return loaderEl;
}

/**
 * Renders an element inside of container.
 * @param {HTMLElement} container - Container element to place element in.
 * @param {HTMLElement} element - Element to add.
 */
export function render(container, element) {
    if (!element) {
        return;
    }
    
    container.innerHTML = '';
    container.appendChild(element);
}

/**
 * Performs actions when page is ready.
 */
export function ready() {
    // clear the count on page view
    clearListingCount();
    removePageLoader();
    fadeIn();
}

/**
 * Empties the contents of the layout.
 */
export function empty() {
    document.querySelector('main').innerHTML = '<p></p>';
}

/**
 * Fades in layout when finished loading.
 */
export function fadeIn() {
    const mainEl = document.querySelector('main');
    
    if (mainEl) {
        Velocity(mainEl, 'fadeIn', {
            duration: 300
        });
    }
}

/**
 * Adds an alert to the page (or changes message if one already exists).
 * @param {(string | Error)} message - Message to display.
 * @param {HTMLElement} beforeEl - Insert before this DOM element.
 * @param {string} [elClass] - Alert class.
 */
export function alert(message, beforeEl, elClass) {
    if (beforeEl == null) {
        // default to first child in main element
        beforeEl = document.querySelector('main').firstChild;
    }
    
    let alertEl = document.querySelector('.alert');
    
    if (!alertEl) {
        // create our elements
        const containerEl = document.createElement('div');
        const textEl = document.createElement('p');
        alertEl = document.createElement('div');
        
        containerEl.classList.add('grid-container', 'section');
        containerEl.appendChild(alertEl);
        alertEl.appendChild(textEl);
        
        // append the container for the alert before 'beforeEl'
        beforeEl.parentNode.insertBefore(containerEl, beforeEl);
    }
    
    if (message instanceof Error || typeof message.message === 'string') {
        const isAppError = Object.values(ERROR_TYPE).includes(message.name);
        
        if (isAppError) {
            console.log(message);
            message = message.message;
        } else {
            // An unexpected error occurred.
            console.error(message);
            const stackTrace = message.stack.replace(/chrome\-extension\:\/\/[A-z0-9]+/g, '');
            let isparseListingsError = stackTrace.includes('parseListings.js');
            isparseListingsError = true;
            
            message = 'An unexpected error occurred.';
            message += '<br/><br/>Please <a href="https://github.com/juliarose/Steam-Market-History-Cataloger/issues">file an issue</a> if one does not already exist on this project\'s Github page with the following stack trace included:';
            message += `<br/><br/><code>${escapeHTML(stackTrace)}</code>`;
            
            if (isparseListingsError) {
                message += '<br/><br/>Also include:<ul><li>Your account\'s language.</li><li>Your account\'s currency.</li><li>A screenshot of your history results at <a href="https://steamcommunity.com/market/#myhistory">https://steamcommunity.com/market</a>. This is optional if you prefer to keep your privacy but will help much more than the above. This extension depends on parsing your history results correctly which can vary in different locales.</li><li>Any other details you feel are relevant.</li></ul>';
            
            }
        }
    }
    
    // set the contents of the element
    alertEl.querySelector('p').innerHTML = message;
    
    // set the class of the element
    alertEl.className = '';
    alertEl.classList.add('alert');
    
    if (elClass) {
        alertEl.classList.add(elClass);
    }
    
    // animate the alert
    const curHeight = alertEl.clientHeight;
    alertEl.style.height = 'auto';
    const autoHeight = alertEl.clientHeight;
    alertEl.style.height = curHeight;
    
    // animate height to auto height
    Velocity(alertEl, {
        height: autoHeight
    }, {
        duration: 160
    }); 
}

/**
 * Adds spinner to page to communicate page is loading.
 */
export function addPageLoader() {
    // loader already exists
    if (document.getElementById('page-loader')) {
        return;
    }
    
    const loaderEl = createSpinner('page-loader', 'page-loader absolute-center', 'lds-default');
    const mainEl = document.querySelector('main');
    
    if (mainEl) {
        document.body.appendChild(loaderEl);
        mainEl.classList.add('unloaded');
    }
}

/**
 * Removes page loader spinner from page.
 */
export function removePageLoader() {
    const loaderEl = document.getElementById('page-loader');
    const mainEl = document.querySelector('main');
    
    if (loaderEl) {
        loaderEl.remove();
    }
    
    if (mainEl) {
        mainEl.classList.remove('unloaded');
    }
}

/**
 * Empties the layout and displays an error message.
 * @memberOf Layout
 * @param {(string | Error)} [error] - Message to display.
 * @param {HTMLElement} [beforeEl] - Insert before this DOM element.
 */
export function error(error, beforeEl) {
    empty();
    ready();
    alert(error, beforeEl, 'error');
}
