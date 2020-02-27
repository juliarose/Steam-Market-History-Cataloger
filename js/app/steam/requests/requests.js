'use strict';

import { get } from './get.js';
import { post } from './post.js';

/**
 * XHR requests for Steam.
 *
 * @namespace Steam.requests
 * @memberOf Steam
 */
const requests = {
    get,
    post
};

export { requests };