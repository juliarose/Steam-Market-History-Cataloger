// this script is included in all "view" scripts
// i.e. pages appearing in the main browser window
// it is called right before the page-specific view script

import * as Layout from '../app/layout/index.js';

// ready
{
    // add page loading indicator
    Layout.addPageLoader();
}
