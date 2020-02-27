'use strict';

import { valuesAsKeys } from '../helpers/utils.js';
import { Listing } from '../classes/listing.js';
import { AccountTransaction } from '../classes/accounttransaction.js';
import { GameItem } from '../classes/gameitem.js';
import { AnnualTotal } from '../classes/totals/annualtotal.js';
import { MonthlyTotal } from '../classes/totals/monthlytotal.js';
import { DailyTotal } from '../classes/totals/dailytotal.js';
import { AppTotal } from '../classes/totals/apptotal.js';

/**
 * Configures display properties for class data in app when localization strings are available.
 * @param {Localization} locales - Localization strings.
 * @returns {undefined}
 */
function configureDisplay(locales) {
    const classes = [
        Listing,
        AccountTransaction,
        GameItem,
        AnnualTotal,
        MonthlyTotal,
        DailyTotal,
        AppTotal
    ];
    const hasConfigureDisplayFunction = (Class) => {
        return typeof Class.makeDisplay === 'function';
    };
    const configure = (Class) => {
        // set the display state for this class using the provided locales object
        Class.display = Class.makeDisplay(locales);
        
        // check for string identifiers
        const hasIdentifiers = Boolean(
            Class.display.identifiers
        );
        
        if (hasIdentifiers) {
            // if the display object has identifers we must set the values as keys
            // so that we are able to get keys using values
            // e.g.
            // { type: 'Banana' }
            // becomes
            // { type: 'Banana', Banana: 'type' }
            Object.entries(Class.display.identifiers).forEach(([set, key]) => {
                Class.display.identifiers[key] = valuesAsKeys(set);
            });
        }
    };
    
    classes
        .filter(hasConfigureDisplayFunction)
        .forEach(configure);
}

export { configureDisplay };