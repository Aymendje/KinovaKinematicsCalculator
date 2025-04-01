/**
 * Error handling and display module
 */

import { 
    setErrorBasedColor,
    setErrorBasedBgColor,
    setErrorBasedResultBoxColor
} from '../helper.js';

/**
 * Update error rate display colors
 * @param {HTMLElement} errorElement - The error element to update
 * @param {string} tabSelector - The selector for the tab containing result boxes
 */
export function updateErrorColors(errorElement, tabSelector) {
    if (!errorElement || 
        errorElement.textContent === '-' || 
        errorElement.textContent === '...' ||
        errorElement.textContent === 'Calcul en cours...') {
        return;
    }
    
    const errorValue = parseFloat(errorElement.textContent);
    if (isNaN(errorValue)) return;
    
    // Reapply colors to the error element
    setErrorBasedColor(errorElement, errorValue);
    
    // Update container background
    const errorContainer = errorElement.closest('.error-rate-container');
    if (errorContainer) {
        setErrorBasedBgColor(errorContainer, errorValue);
    }
    
    // Update result boxes
    const resultBoxes = document.querySelectorAll(`${tabSelector} .result-box`);
    resultBoxes.forEach(box => {
        setErrorBasedResultBoxColor(box, errorValue);
        if (errorValue >= 0.001) {
            setErrorBasedColor(box, errorValue);
        }
    });
}

/**
 * Refresh error rate display colors based on current theme
 */
export function refreshErrorRateColors() {
    // FK error rate
    const fkErrorRate = document.getElementById('fk-error-rate');
    updateErrorColors(fkErrorRate, '#forward-tab');
    
    // IK error rate
    const ikErrorRate = document.getElementById('ik-position-error');
    updateErrorColors(ikErrorRate, '#inverse-tab');
}

/**
 * Handle calculation errors
 * @param {string} operation - The operation being performed
 * @param {string} type - The preset type or calculation type
 * @param {Error} error - The error that occurred
 */
export function handleCalculationError(operation, type, error) {
    console.error(`Error ${operation} for ${type}:`, error);
    
    // We could add error UI display here like a toast message
} 