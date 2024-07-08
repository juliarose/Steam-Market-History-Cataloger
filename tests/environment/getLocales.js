import { Localization } from '../../js/app/models/Localization.js';

async function getLocales(language = 'english') {
    return await Localization.get(language);
}

module.exports = getLocales;