'use strict';

// substr polyfill
// https://stackoverflow.com/a/77882760
function substr(s, start, length) {
    const size = s.length;
    let intStart = Number.isNaN(Number(start)) ? 0 : Number.parseInt(start);
    
    if (intStart === -Infinity) {
        intStart = 0;
    } else if (intStart < 0) {
        intStart = Math.max(size + intStart, 0);
    } else {
        intStart = Math.min(intStart, size);
    }
    
    let intLength = length === undefined ? size : (Number.isNaN(Number(length)) ? 0 : Number.parseInt(length));
    intLength = Math.max(Math.min(intLength, size), 0);
    
    let intEnd = Math.min(intStart + intLength, size);
    
    return s.substring(intStart, intEnd);
}

/**
 * Get individual color channel from color.
 * @param {string} color - 6-digit hexadecimal number of color.
 * @param {number} position - Position of color (0-2).
 * @returns {string} Value of channel.
 *
 * @example
 * getChannel('00FF00', 1); // 'FF'
 */
function getChannel(color, position) {
    return substr(color, position * 2, 2);
}

/**
 * Convert a decimal number to a hexadecimal number in a 2-digit format.
 * @param {number} decimal - Decimal number.
 * @returns {string} Hexadecimal number.
 */
function toHex(decimal) {
    let n = decimal.toString(16).toUpperCase();
    
    if (n.length === 1) {
        // must be 2 characters
        return '0' + n;
    } else {
        return n;
    }
}

/**
 * Convert a hexadecimal number to a decimal number.
 * @param {string} hex - Hexadecimal number.
 * @returns {number} Decimal number.
 */
function toDecimal(hex) {
    return parseInt(hex, 16);
}

/**
 * @namespace Color
 */
export const Color = {
    /**
     * Lighten a color.
     * @memberOf Color
     * @param {string} color - 6-digit hexadecimal number of color.
     * @param {number} [ratio=0.5] - Strength of effect.
     * @returns {string} 6-digit hexadecimal number of result.
     */
    lighten: function(color, ratio = 0.5) {
        let results = [];
        
        // 3 times for R,G,B
        for (let i = 0; i < 3; i++) {
            // if i is 0, this will select the first two letters,
            // convert them to decimal, add 255, then multiply by ratio
            let calc = (toDecimal(getChannel(color, i)) + 255) * ratio;
            // decimal must not be over 255
            let decimal = Math.floor(Math.min(calc, 255));
            let hex = toHex(decimal);
            
            results.push(hex);
        }
        
        return results.join('');
    },
    /**
     * Darken a color.
     * @memberOf Color
     * @param {string} color - 6-digit hexadecimal number of color.
     * @param {number} [ratio=0.5] - Strength of effect.
     * @returns {string} 6-digit hexadecimal number of result.
     */
    darken: function(color, ratio) {
        let results = [];
        
        for (let i = 0; i < 3; i++) {
            let decimal = Math.floor(toDecimal(getChannel(color, i)) * (1 - ratio));
            let hex = toHex(decimal);
            
            results.push(hex);
        }
        
        return results.join('');
    },
    /**
     * Blend two colors.
     * @memberOf Color
     * @param {string} color1 - 6-digit hexadecimal number of first color.
     * @param {string} color2 - 6-digit hexadecimal number of second color.
     * @param {number} [ratio=0.5] - Strength of effect.
     * @returns {string} 6-digit hexadecimal number of result.
     */
    blend: function(color1, color2, ratio = 0.5) {
        let results = [];
        
        for (let i = 0; i < 3; i++) {
            let calc1 = (toDecimal(getChannel(color1, i)) * (1 - ratio));
            let calc2 = (toDecimal(getChannel(color2, i)) * ratio);
            let decimal = Math.floor(calc1 + calc2);
            let hex = toHex(decimal);
            
            results.push(hex);
        }
        
        return results.join('');
    },
    /**
     * Convert color to rgba string for use in CSS.
     * @memberOf Color
     * @param {string} color - 6-digit hexadecimal number of color.
     * @param {number} [alpha=1] - Opacity of color.
     * @returns {string} Rgba string of color.
     */
    rgba: function(color, alpha = 1) {
        let results = [];
        
        for (let i = 0; i < 3; i++) {
            let decimal = Math.floor(toDecimal(getChannel(color, i)));
            
            results.push(decimal);
        }
        
        // add value for alpha
        results.push(alpha);
        
        return 'rgba(' + results.join(',') + ')';
    },
    /**
     * Get the luminance of a color.
     * @memberOf Color
     * @param {string} color - 6-digit hexadecimal number of first color.
     * @returns {Nunber} Luminance of color.
     */
    luminance: function(color) {
        // get luminance using
        // https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-tests
        let result = 0;
        let values = [
            0.2126,
            0.7152,
            0.0722
        ];
        let min = 0.03928;
        
        for (let i = 0; i < 3; i++) {
            let ratio = toDecimal(getChannel(color, i)) / 255;
            let value = values[i];
            let calc = ratio;
            
            if (calc <= min) {
                calc /= 12.92;
            } else {
                calc = Math.pow((calc + 0.055) / 1.055, 2.4);
            }
            
            calc *= value;
            result += calc;
        }
        
        return result;
    }
};