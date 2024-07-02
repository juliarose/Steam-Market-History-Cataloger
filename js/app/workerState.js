// @ts-check

import { LocalStorage } from './storage/local.js';

const WORKER_STATE_SETTINGS_NAME = 'worker_state';

/**
 * Used for loading and saving worker state.
 */
export const workerStateStorage = new LocalStorage(WORKER_STATE_SETTINGS_NAME);

/**
 * @typedef {Object} WorkerState
 * @property {number} listing_count - Number of listings collected by the worker.
 */

/**
 * Gets worker state.
 * @returns {Promise<WorkerState>} WorkerState.
 */
export async function getWorkerState() {
    const workerState = await workerStateStorage.getSettings() || {};
    
    return Object.assign({
        listing_count: 0
    }, workerState);
}

/**
 * Saves worker state.
 * @param {WorkerState} workerState - State to save.
 * @returns {Promise<void>} Resolves when done.
 */
export async function saveWorkerState(workerState) {
    return workerStateStorage.saveSettings(workerState);
}

/**
 * Adds worker state to existing worker state.
 * @param {Object} workerState - State to add.
 * @returns {Promise<void>} Resolves when done.
 */
export async function addWorkerState(workerState) {
    const currentWorkerState = await getWorkerState();
    // merge the worker state
    const mergedWorkerState = Object.assign({}, currentWorkerState, workerState);
    
    return saveWorkerState(mergedWorkerState);
}
