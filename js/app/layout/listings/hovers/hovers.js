// @ts-check

import { getClassinfo } from '../../../steam/index.js';
import { escapeHTML } from '../../../helpers/utils.js';
import { AppError } from '../../../error.js';

// id for current hover
// since requests are done through AJAX,
// this aids in preventing hovers from popping up when they are no longer needed
let hoverID = 0;

/**
 * Gets a hover asset depending on hover ID.
 * @param {string} appid - Appid for asset.
 * @param {string} classid - Classid for asset.
 * @param {string} instanceid - Instanceid for asset.
 * @param {string} [language='english'] - Language.
 * @returns {Promise<Object>} Resolves with asset when done, reject on failure.
 */
export async function getHoverAsset(appid, classid, instanceid, language = 'english') {
    addToHoverState();
    
    const id = hoverID;
    const asset = await getClassinfo(appid, classid, instanceid, language);
    
    // if the hover ID has changed, then we don't want to display this asset anymore
    if (id !== hoverID) {
        throw new AppError('No asset');
    }
    
    return asset;
}

/**
 * Gets HTML for hover describing asset.
 * @param {Object} asset - Asset to display.
 * @returns {string} HTML string describing asset.
 */
export function getHover(asset) {
    const isEmpty = (description) => {
        return Boolean(
            description &&
            description.value.trim() === ''
        );
    };
    const name = asset.name;
    // the image size of the icon in pixels
    const imgSize = 192;
    // the color we'll use for display the name
    const nameColor = asset.name_color || 'FFFFFF';
    // the icon for the item
    const iconURL =`https://steamcommunity-a.akamaihd.net/economy/image/${asset.icon_url_large}/300x${imgSize}`;
    // the item "type" e.g. "Level 30 Hat"
    const type = `<div>${asset.type}</div>`;
    // the header for the item, which holds the name
    const header = `<h4 style="color: #${nameColor}">${name}</h4>`;
    // the image for the item
    const img = `<img src="${iconURL}" width="${imgSize}" height="${imgSize}"/>`;
    // the image wrapped in its own div
    const imgWrapper = `<div class="header-image">${img}</div>`;
    // item descriptions
    const assetDescriptions = asset.descriptions || [];
    // filtered descriptions
    const filteredDescriptions = assetDescriptions.filter((description, i) => {
        const prev = assetDescriptions[i - 1];
        const prevPrev = assetDescriptions[i - 2];
        const isRepeatingEmptyDescription = Boolean(
            isEmpty(prev) &&
            isEmpty(prevPrev) &&
            isEmpty(description)
        );
        
        if (isRepeatingEmptyDescription) {
            // this will trim repeating empty descriptions of 3 or more
            // e.g. 3+ descriptions in a row with a value of " "
            return false;
        }
        
        return true;
    });
    // the html for descriptions
    const descriptions = filteredDescriptions.map((description) => {
        const attributes = description.color ? `style="color: #${description.color}"` : '';
        let value = description.value.trim();
        
        if (description.type !== 'html') {
            value = escapeHTML(value) || '&nbsp;';
        }
        
        return `<div ${attributes}>${value}</div>`;
    }).join('');
    // the html for this asset
    const html = [
        imgWrapper,
        header,
        type,
        descriptions
    ].join('');
    
    return html;
}

/**
 * Increments the hover state.
 */
export function addToHoverState() {
    hoverID += 1;
}
