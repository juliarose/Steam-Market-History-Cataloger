'use strict';

import { ListingLayout } from './listings/layout.js';
import { buildTable } from './buildTable.js';
import { tooltip } from './tooltip.js';
import { sendMessage } from '../browser.js';
import { getLayoutOptions } from './getLayoutOptions.js';
// importing this file enables dropdowns on page
import '../helpers/dropdown.js'; 

/**
 * Sends a message to clear the listing count.
 * @returns {undefined}
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
 * Layout helper functions.
 *
 * @namespace Layout
 */
export const Layout = {
    buildTable,
    tooltip,
    getLayoutOptions,
    listings: ListingLayout,
    /**
     * Renders an element inside of container.
     * @memberOf Layout
     * @param {HTMLElement} container - Container element to place element in.
     * @param {HTMLElement} element - Element to add.
     * @returns {undefined}
     */
    render: function(container, element) {
        if (!element) {
            return;
        }
        
        container.innerHTML = '';
        container.appendChild(element);
    },
    /**
     * Performs actions when page is ready.
     * @memberOf Layout
     * @returns {undefined}
     */
    ready: function() {
        // clear the count on page view
        clearListingCount();
        Layout.removePageLoader();
        Layout.fadeIn();
    },
    /**
     * Empties the contents of the layout.
     * @memberOf Layout
     * @returns {undefined}
     */
    empty: function() {
        document.querySelector('main').innerHTML = '<p></p>';
    },
    /**
     * Fades in layout when finished loading.
     * @memberOf Layout
     * @returns {undefined}
     */
    fadeIn: function() {
        const mainEl = document.querySelector('main');
        
        if (mainEl) {
            Velocity(mainEl, 'fadeIn', {
                duration: 300
            });
        }
    },
    /**
     * Adds an alert to the page (or changes message if one already exists).
     * @memberOf Layout
     * @param {string} message - Message to display.
     * @param {HTMLElement} beforeEl - Insert before this DOM element.
     * @param {string} [elClass] - Alert class.
     * @returns {undefined}
     */
    alert: function(message, beforeEl, elClass) {
        if (beforeEl == null) {
            // default to first child in main element
            beforeEl = document.querySelector('main').firstChild;
        }
        
        function animate(el){
            const curHeight = el.clientHeight;
            el.style.height = 'auto';
            const autoHeight = el.clientHeight;
            el.style.height = curHeight;
            
            // animate height to auto height
            Velocity(el, {
                height: autoHeight
            }, {
                duration: 160
            }); 
        }
        
        // set the contents of the element
        function setText(el, message) {
            el.querySelector('p').innerHTML = message;
        }
        
        // set the class of the element
        function setClass(el) {
            el.className = '';
            el.classList.add('alert');
            
            if (elClass) {
                el.classList.add(elClass);
            }
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
        
        setText(alertEl, message);
        setClass(alertEl);
        animate(alertEl);
    },
    /**
     * Adds spinner to page to communicate page is loading.
     * @memberOf Layout
     * @returns {undefined}
     */
    addPageLoader: function() {
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
    },
    /**
     * Removes page loader spinner from page.
     * @memberOf Layout
     * @returns {undefined}
     */
    removePageLoader: function() {
        const loaderEl = document.getElementById('page-loader');
        const mainEl = document.querySelector('main');
        
        if (loaderEl) {
            loaderEl.remove();
        }
        
        if (mainEl) {
            mainEl.classList.remove('unloaded');
        }
    },
    /**
     * Empties the layout and displays an error message.
     * @memberOf Layout
     * @param {string} [error] - Message to display.
     * @param {HTMLElement} [beforeEl] - Insert before this DOM element.
     * @returns {undefined}
     */
    error: function(error, beforeEl) {
        Layout.empty();
        Layout.ready();
        Layout.alert(typeof error === 'string' ? error : 'Error', beforeEl, 'error');
    }
};