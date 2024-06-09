'use strict';

import { setIcon } from '../browser.js';

/**
 * Updates extension icon based on loading state.
 * @param {boolean} isLoading - Load state to set.
 */
export function setLoadState(isLoading) {
    const iconPath = (
        isLoading ?
            '/images/icon_loading.png' :
            '/images/icon.png'
    );
    
    setIcon({
        path: iconPath
    });
}
