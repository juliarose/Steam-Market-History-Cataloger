'use strict';

import { buildApp } from './app.js';

export async function readyState(onApp, onError) {
    try {
        onApp(await buildApp());
    } catch (error) {
        onError(error);
    }
}