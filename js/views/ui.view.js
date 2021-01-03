'use strict';

// this script is included in all "view" scripts
// i.e. pages appearing in the main browser window
// it is called right before the page-specific view script

import { Layout } from '../app/layout/layout.js';

// ready
(function() {
    // add page loading indicator
    Layout.addPageLoader();
}());