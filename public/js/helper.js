/**
 * Helper functions and utilities
 */
import colors from './colors.js';

/**
 * Round a number to a specific number of decimal places
 * @param {number} num - Number to round
 * @param {number} decimals - Number of decimal places (default: 4)
 * @returns {number} - Rounded number
 */
function roundTo(num, decimals = 4) {
    return Number(num.toFixed(decimals));
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} - Angle in radians
 */
function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Create position object (mm, degrees) from kinematics result (m, degrees)
 * @param {Object} pose - Pose object with x, y, z, thetaX, thetaY, thetaZ in m and degrees
 * @returns {Object} - Position object with values in mm and degrees
 */
function createPosition(pose) {
    if (!pose) return null; // Handle null input
    return {
        x: roundTo(pose.x * 1000, 2), // Conversion to mm
        y: roundTo(pose.y * 1000, 2),
        z: roundTo(pose.z * 1000, 2),
        thetaX: roundTo(pose.thetaX, 2),
        thetaY: roundTo(pose.thetaY, 2),
        thetaZ: roundTo(pose.thetaZ, 2)
    };
}

/**
 * Generate a random number in a given range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random number in the specified range
 */
function getRandomInRange(min, max) {
    return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

/**
 * Clamp a value between a minimum and maximum
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} - Clamped value
 */
function clampValue(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Set text color based on error value
 * @param {HTMLElement} element - Element to set color for
 * @param {number} errorValue - Error value to determine color
 */
function setErrorBasedColor(element, errorValue) {
    // Check if dark mode is active
    const isDarkMode = document.body.classList.contains('dark-mode-applied');
    const theme = isDarkMode ? 'DARK' : 'LIGHT';
    
    if (errorValue < 0.001) {
        element.style.color = colors.SUCCESS.TEXT[theme];
    } else if (errorValue < 1) {
        element.style.color = colors.WARNING.TEXT[theme];
    } else {
        element.style.color = colors.ERROR.TEXT[theme];
    }
}

/**
 * Set background color for containers based on error value
 * @param {HTMLElement} container - Container element
 * @param {number} errorValue - Error value to determine color
 */
function setErrorBasedBgColor(container, errorValue) {
    // Check if dark mode is active
    const isDarkMode = document.body.classList.contains('dark-mode-applied');
    const theme = isDarkMode ? 'DARK' : 'LIGHT';
    
    if (errorValue < 0.001) {
        container.style.backgroundColor = colors.SUCCESS.BG[theme];
        container.style.borderLeftColor = colors.SUCCESS.BORDER[theme];
    } else if (errorValue < 1) {
        container.style.backgroundColor = colors.WARNING.BG[theme];
        container.style.borderLeftColor = colors.WARNING.BORDER[theme];
    } else {
        container.style.backgroundColor = colors.ERROR.BG[theme];
        container.style.borderLeftColor = colors.ERROR.BORDER[theme];
    }
}

/**
 * Set background color for result box based on error value
 * @param {HTMLElement} resultBox - Result box element
 * @param {number} errorValue - Error value to determine color
 */
function setErrorBasedResultBoxColor(resultBox, errorValue) {
    // Check if dark mode is active
    const isDarkMode = document.body.classList.contains('dark-mode-applied');
    const theme = isDarkMode ? 'DARK' : 'LIGHT';
    
    if (errorValue < 0.001) {
        resultBox.style.backgroundColor = ''; // No background color for good results
    } else if (errorValue < 1) {
        resultBox.style.backgroundColor = colors.WARNING.BG[theme];
    } else {
        resultBox.style.backgroundColor = colors.ERROR.BG[theme];
    }
}

// Export functionality
export {
    roundTo,
    degreesToRadians,
    createPosition,
    getRandomInRange,
    clampValue,
    setErrorBasedColor,
    setErrorBasedBgColor,
    setErrorBasedResultBoxColor
}; 