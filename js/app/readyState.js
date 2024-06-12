import { buildApp } from './app.js';

/**
 * Builds the app and calls the onApp callback with the app instance.
 * @param {Function} onApp - Callback to call with the app instance. 
 * @param {Function} onError - Callback to call with the error if the app fails to build.
 */
export async function readyState(onApp, onError) {
    try {
        onApp(await buildApp());
    } catch (error) {
        onError(error);
    }
}
