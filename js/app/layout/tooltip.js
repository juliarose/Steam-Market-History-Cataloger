// @ts-check

/**
 * Gets the offset of an element.
 * @param {Element} element - Element to get offset of.
 * @returns {{top: number, left: number}} Offset.
 */
function offset(element) {
    const bounds = element.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    return {
        top: bounds.top + scrollTop,
        left: bounds.left + scrollLeft
    };
}

/**
 * Fades in an element.
 * @param {Element} element - Element to fade in.
 * @param {number} duration - Duration of fade, in milliseconds.
 */
function fadeIn(element, duration) {
    // @ts-ignore
    Velocity(element, 'fadeIn', {
        duration
    });
}

/**
 * Builds a tooltip.
 * @param {HTMLElement} element - Element to position next to.
 * @param {string} contents - HTML contents.
 * @param {Object} [options={}] - Options.
 * @param {Object} [options.borderColor] - Hexadecimal color for border.
 * @returns {Object} DOM element of table.
 */
export function tooltip(element, contents, options = {}) {
    const found = document.getElementById('tooltip');
    const toolTipEl = found || document.createElement('div');
    const bounds = offset(element);
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollBottom = window.innerHeight + scrollTop;
    
    toolTipEl.setAttribute('id', 'tooltip');
    toolTipEl.classList.add('tooltip');
    toolTipEl.innerHTML = contents;
    
    if (options.borderColor) {
        toolTipEl.style.borderColor = '#' + options.borderColor;
    }
    
    if (!found) {
        document.body.appendChild(toolTipEl);
    }
    
    let x = bounds.left + element.offsetWidth + 20;
    let y = bounds.top - 60;
    const difference = scrollBottom - (y + toolTipEl.offsetHeight);
    
    if (difference < 0) {
        y = Math.max(20, y + (difference - 20));
    }
    
    toolTipEl.style.left = x + 'px';
    toolTipEl.style.top = y + 'px';
    fadeIn(toolTipEl, 150);
}

/**
 * Removes tooltip.
 */
export function removeTooltip() {
    const found = document.getElementById('tooltip');
    
    if (found != null) {
        found.remove();
    }
}
