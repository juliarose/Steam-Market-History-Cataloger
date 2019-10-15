import {Localization} from '../../js/app/classes/localization.js';

function getLocales(language = 'english') {
    const locales = new Localization();
    
    return locales.get(language)
        .then(() => {
            return locales;
        });
}

module.exports = getLocales;