import { Localization } from '../../js/app/classes/localization.js';

async function getLocales(language = 'english') {
    return await Localization.get(language);
}

module.exports = getLocales;