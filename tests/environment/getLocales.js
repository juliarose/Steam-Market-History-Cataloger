import { Localization } from '../../js/app/classes/Localization.js';

async function getLocales(language = 'english') {
    return await Localization.get(language);
}

module.exports = getLocales;