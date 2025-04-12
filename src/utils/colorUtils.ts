// src/utils/colorUtils.ts
/**
 * Calculates the perceived brightness of a hex color and determines if it's light.
 * Handles #RGB, #RGBA, #RRGGBB, and #RRGGBBAA formats.
 * @param hexColor The hex color to analyze
 * @returns true if light, false if dark
 */
export function isColorLight(hexColor: string | null | undefined): boolean {
    if (!hexColor || typeof hexColor !== 'string') {
        return true; // Default to light background for safety
    }

    // Remove # if present
    let color = hexColor.startsWith('#') ? hexColor.substring(1) : hexColor;
    
    // Handle hex with alpha channel - extract just the RGB part
    if (color.length === 8) { // #RRGGBBAA format
        color = color.substring(0, 6);
    } else if (color.length === 4) { // #RGBA format
        color = color.substring(0, 3);
    }
    
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    if (color.length === 3) {
        color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }

    if (color.length !== 6) {
        console.warn(`[isColorLight] Invalid hex color format provided: ${hexColor}, using default`);
        return true; // Default to light background
    }

    try {
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);

        // Calculate perceived brightness using the standard formula
        // (weights based on human perception of R, G, B)
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        // Threshold: Colors with brightness > 150 are considered light
        return brightness > 150;
    } catch (e) {
        console.error(`[isColorLight] Error parsing hex color: ${hexColor}`, e);
        return true; // Default to light background on error
    }
}

/**
 * Extracts the RGB part of a hex color, removing any alpha channel
 * @param hexColor The hex color, potentially with alpha
 * @returns The hex color without alpha channel
 */
export function getRgbFromHex(hexColor: string): string {
    if (!hexColor || !hexColor.startsWith('#')) {
        return hexColor;
    }
    
    let color = hexColor.substring(1); // Remove #
    
    // Handle different formats
    if (color.length === 8) { // #RRGGBBAA
        return '#' + color.substring(0, 6);
    } else if (color.length === 4) { // #RGBA
        return '#' + color.substring(0, 3);
    }
    
    // Already RGB format, return as is
    return hexColor;
}

/**
 * Adds an alpha channel to a hex color
 * @param hexColor The hex color (#RGB or #RRGGBB)
 * @param alpha Alpha value (0-1 or 0-100)
 * @returns Hex color with alpha channel
 */
export function addAlphaToHex(hexColor: string, alpha: number): string {
    if (!hexColor || !hexColor.startsWith('#')) {
        return hexColor;
    }
    
    // Normalize alpha to 0-1 range
    let normalizedAlpha = alpha;
    if (alpha > 1) {
        normalizedAlpha = alpha / 100;
    }
    
    // Convert to 0-255 range and then to hex
    const alphaHex = Math.round(normalizedAlpha * 255)
        .toString(16)
        .padStart(2, '0');
    
    // Add alpha to color
    return getRgbFromHex(hexColor) + alphaHex;
}

/**
 * Converts a hex color to an rgba() string
 * Useful for setting colors with opacity in CSS
 * @param hexColor The hex color
 * @param alpha Opacity value from 0-1
 * @returns rgba() string
 */
export function hexToRgba(hexColor: string, alpha: number = 1): string {
    if (!hexColor || !hexColor.startsWith('#')) {
        return `rgba(0, 0, 0, ${alpha})`;
    }
    
    let color = hexColor.startsWith('#') ? hexColor.substring(1) : hexColor;
    
    // Handle alpha in the input hex (we'll ignore it and use the provided alpha)
    if (color.length === 8) { // #RRGGBBAA
        color = color.substring(0, 6);
    } else if (color.length === 4) { // #RGBA
        color = color.substring(0, 3);
    }
    
    // Expand shorthand form
    if (color.length === 3) {
        color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }
    
    if (color.length !== 6) {
        console.warn(`[hexToRgba] Invalid hex color format provided: ${hexColor}`);
        return `rgba(0, 0, 0, ${alpha})`;
    }
    
    try {
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (e) {
        console.error(`[hexToRgba] Error parsing hex color: ${hexColor}`, e);
        return `rgba(0, 0, 0, ${alpha})`;
    }
}