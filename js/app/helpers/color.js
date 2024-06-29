/**
 * Color utilities.
 * @module Color
 */

/**
 * Lightens a color.
 * @param {string} color - Hexadecimal number string of color.
 * @param {number} [ratio=0.5] - Strength of effect.
 * @returns {string} 6-digit hexadecimal number string of result.
*/
export function lighten(color, ratio) {
    ratio = clampRatio(ratio);
    
    const channels = hexToRgb(color);
    const [h, s, l] = rgbToHSL(...channels);
    // increase lightness
    const lightenedlightness = l + (100 - l) * ratio;
    const lightenedChannels = hslToRGB(h, s, lightenedlightness);
    let result = '';
    
    for (let i = 0; i < 3; i++) {
        result += decimalToHex(lightenedChannels[i]);
    }
    
    return result;
}

/**
 * Darkens a color.
 * @param {string} color - Hexadecimal number string of color.
 * @param {number} [ratio=0.5] - Strength of effect.
 * @returns {string} 6-digit hexadecimal number string of result.
 */
export function darken(color, ratio) {
    ratio = clampRatio(ratio);
    
    const channels = hexToRgb(color);
    let result = '';
    
    for (let i = 0; i < 3; i++) {
        const calc = channels[i] * (1 - ratio);
        const decimal = toUint8Saturating(calc);
        const hex = decimalToHex(decimal);
        
        result += hex;
    }
    
    return result;
}

/**
 * Blends two colors.
 * @param {string} color1 - Hexadecimal number string of first color.
 * @param {string} color2 - Hexadecimal number string of second color.
 * @param {number} [ratio=0.5] - Strength of effect.
 * @returns {string} 6-digit hexadecimal number string of result.
 */
export function blend(color1, color2, ratio = 0.5) {
    ratio = clampRatio(ratio);
    
    const channels1 = hexToRgb(color1);
    const channels2 = hexToRgb(color2);
    let result = '';
    
    for (let i = 0; i < 3; i++) {
        const calc1 = channels1[i] * (1 - ratio);
        const calc2 = channels2[i] * ratio;
        const decimal = toUint8Saturating(calc1 + calc2);
        const hex = decimalToHex(decimal);
        
        result += hex;
    }
    
    return result;
}

/**
 * Converts color to rgba string for use in CSS.
 * @param {string} color - Hexadecimal number string.
 * @param {number} [alpha=1] - Opacity of color.
 * @returns {string} Rgba string of color.
 */
export function rgba(color, alpha = 1) {
    alpha = clampRatio(alpha);
    
    const results = hexToRgb(color);
    
    // add value for alpha
    results.push(alpha);
    
    return `rgba(${results.join(' ')})`;
}

/**
 * Gets the lightness of a color.
 * @param {string} color - Hexadecimal number string.
 * @returns {number} Lightness of color.
 */
export function lightness(color) {
    // get lightness using
    // https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-tests
    const channels = hexToRgb(color);
    const values = [
        0.2126,
        0.7152,
        0.0722
    ];
    const min = 0.03928;
    let result = 0;
    
    for (let i = 0; i < 3; i++) {
        const ratio = channels[i] / 255;
        const value = values[i];
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

/**
 * Converts RGB color to HSL color.
 * @param {number} red - Red color channel.
 * @param {number} green - Green color channel.
 * @param {number} blue - Blue color channel.
 * @returns {number[]} HSL color channels.
 * 
 * @example
 * rgbToHSL(0, 255, 0); // [120, 100, 50]
 */
export function rgbToHSL(red, green, blue) {
    // https://stackoverflow.com/questions/46432335/hex-to-hsl-convert-javascript
    red = red / 255;
    green = green / 255;
    blue = blue / 255;
    
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    let hue, saturation, lightness = (max + min) / 2;
    
    if (max === min){
        hue = saturation = 0; // achromatic
    } else {
        const difference = max - min;
        
        if (lightness > 0.5) {
            saturation = difference / (2 - max - min);
        } else {
            saturation = difference / (max + min);
        }
        
        switch (max) {
            case red:
                let offset = green < blue ? 6 : 0;
                
                hue = ((green - blue) / difference) + offset;
                break;
            case green:
                hue = ((blue - red) / difference) + 2;
                break;
            case blue:
                hue = ((red - green) / difference) + 4;
                break;
        }
        
        hue = hue / 6;
    }
    
    saturation = Math.round(saturation * 100);
    lightness = Math.round(lightness * 100);
    hue = Math.round(360 * hue);
    
    return [
        hue,
        saturation,
        lightness
    ];
}

/**
 * Converts HSL color to RGB color.
 * @param {number} hue - Hue value.
 * @param {number} saturation - Saturation value.
 * @param {number} lightness - Lightness value.
 * @returns {number[]} RGB color channels.
 * 
 * @example
 * hslToRGB(120, 100, 50); // [0, 255, 0]
*/
export function hslToRGB(hue, saturation, lightness) {
    hue = hue / 360;
    saturation = saturation / 100;
    lightness = lightness / 100;
    
    let red, green, blue;
    
    if (saturation === 0) {
        red = green = blue = lightness; // achromatic
    } else {
        const hueToRGB = (p, q, t) => {
            if (t < 0) {
                t += 1;
            }
            
            if (t > 1) {
                t -= 1;
            }
            
            if (t < 1 / 6) {
                return p + (q - p) * 6 * t;
            }
            
            if (t < 1 / 2) {
                return q;
            }
            
            if (t < 2 / 3) {
                return p + (q - p) * (2 / 3 - t) * 6;
            }
            
            return p;
        };
        const q = lightness < 0.5 ?
            lightness * (1 + saturation) :
            (lightness + saturation) - (lightness * saturation);
        const p = 2 * lightness - q;
        
        red = hueToRGB(p, q, hue + 1 / 3);
        green = hueToRGB(p, q, hue);
        blue = hueToRGB(p, q, hue - 1 / 3);
    }
    
    return [
        Math.round(red * 255),
        Math.round(green * 255),
        Math.round(blue * 255)
    ];
}

/**
 * Gets individual color channels from a hexadecimal color. If an alpha channel is present, it 
 * will be included.
 * @param {string} color - Hexadecimal number string.
 * @returns {number[]} Color channels.
 * 
 * @example
 * hexToRgb('#00FF00', 0); // [0, 255, 0]
 * 
 * @example
 * hexToRgb('#00FF00FF', 0); // [0, 255, 0, 255]
 */
export function hexToRgb(color) {
    if (color[0] === '#') {
        // Trim the pound sign
        color = color.slice(1);
    }
    
    const length = color.length;
    const isValidLength = length === 3 || length === 4 || length === 6 || length === 8;
    
    if (!isValidLength) {
        return null;
    }
    
    const decimal = parseInt(color, 16);
    
    switch (length) {
        case 3: return [
            // Red
            ((decimal >> 8) & 0xf) * 0x11,
            // Green
            ((decimal >> 4) & 0xf) * 0x11,
            // Blue
            (decimal & 0xf) * 0x11
        ];
        case 4: return [
            // Red
            ((decimal >> 12) & 0xf) * 0x11,
            // Green
            ((decimal >> 8) & 0xf) * 0x11,
            // Blue
            ((decimal >> 4) & 0xf) * 0x11,
            // Alpha
            (decimal & 0xf) * 0x11
        ];
        case 6: return [
            // Red
            (decimal >> 16) & 0xff,
            // Green
            (decimal >> 8) & 0xff,
            // Blue
            decimal & 0xff
        ];
        case 8: return [
            // Red
            (decimal >> 24) & 0xff,
            // Green
            (decimal >> 16) & 0xff,
            // Blue
            (decimal >> 8) & 0xff,
            // Alpha
            decimal & 0xff
        ];
    }
}

/**
 * Convert a decimal number to a hexadecimal number in a 2-digit format.
 * @param {number} decimal - Decimal number for color channel in 8-bit unsigned integer range.
 *     This must be >=0 and <=255.
 * @returns {string} Hexadecimal number.
 */
function decimalToHex(decimal) {
    if (decimal < 0 || decimal > 255) {
        throw new Error('Invalid decimal range');
    }
    
    const n = decimal.toString(16);
    
    if (n.length === 1) {
        // must be 2 characters
        return '0' + n;
    }
    
    return n;
}

/**
 * Converts a number to an 8-bit unsigned integer. Saturates the value if it's out of range.
 * @param {number} num - Number to convert.
 * @returns {number} The number within the 8-bit unsigned integer range.
 */
function toUint8Saturating(num) {
    if (num < 0) {
        return 0;
    } else if (num > 255) {
        return 255;
    }
    
    return Math.round(num);
}

/**
 * Clamps a ratio to between 0 and 1.
 * @param {number} ratio - Ratio to clamp. 
 * @returns Ratio clamped between 0 and 1.
 */
function clampRatio(ratio) {
    if (ratio < 0) {
        return 0;
    }
    
    if (ratio > 1) {
        return 1;
    }
    
    return ratio;
}
