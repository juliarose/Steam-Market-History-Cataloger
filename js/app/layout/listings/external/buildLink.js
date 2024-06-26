// @ts-check

/**
 * Builds an external link.
 * @param {Object} data - Data for link.
 * @param {string} data.url - URL for link.
 * @param {string} data.title - Text for link.
 * @param {boolean} [data.placeholder] - Whether this is a placeholder link or not.
 * @returns {HTMLElement} Element object.
 */
export function buildLink(data) {
    const buttonEl = document.createElement('div');
    const linkEl = document.createElement('a');
    
    linkEl.setAttribute('href', data.url);
    linkEl.setAttribute('target', '_blank');
    linkEl.setAttribute('rel', 'noreferrer');
    linkEl.append(buttonEl);
    
    if (data.placeholder) {
        linkEl.classList.add('placeholder');
    }
    
    buttonEl.classList.add('button');
    buttonEl.textContent = data.title;
    
    return linkEl;
}
