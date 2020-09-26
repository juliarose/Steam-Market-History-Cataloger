'use strict';

import { applist } from '../data/applist.js';

/**
 * Loads data for app.
 * @returns {Promise} Resolve when done.
 */
export async function loadData() {
    await applist.get();
}