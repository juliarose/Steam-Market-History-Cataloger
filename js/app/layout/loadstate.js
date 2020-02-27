'use strict';

import { setIcon } from '../browser.js';

/**
 * Updates extension icon based on loading state.
 * @param {Boolean} isLoading - Load state to set.
 * @returns {undefined}
 */
function setLoadState(isLoading) {
    const iconPath = (
        isLoading ?
            '/images/icon_loading.png' :
            '/images/icon.png'
    );
    
    setIcon({
        path: iconPath
    });
}

export { setLoadState };