/**
 * Sync module for data synchronization between UI components
 */

/**
 * Helper to sync results between FK and IK tabs
 * @param {string[]} sourceSuffixes - Array of suffixes for source elements
 * @param {string[]} targetIds - Array of target element IDs
 * @param {string} sourcePrefix - Prefix for source elements
 * @param {Function} formatValue - Function to format values (optional)
 * @param {string[]} noValueIndicators - Strings indicating no value is present
 * @returns {boolean} Whether sync was successful
 */
export function syncValues(sourceSuffixes, targetIds, sourcePrefix = '', formatValue = (v) => parseFloat(v).toFixed(2), noValueIndicators = ['-', '...']) {
    let hasValidValues = true;
    const values = [];
    
    // Get all values from source
    for (const suffix of sourceSuffixes) {
        const element = document.getElementById(`${sourcePrefix}${suffix}`);
        if (!element) {
            hasValidValues = false;
            break;
        }
        
        const valueText = element.textContent.replace(',', '.');
        const value = parseFloat(valueText);
        
        // Skip if we don't have valid numbers
        if (isNaN(value) || noValueIndicators.includes(valueText)) {
            hasValidValues = false;
            break;
        }
        
        values.push(value);
    }
    
    // Update target inputs if all values are valid
    if (hasValidValues) {
        targetIds.forEach((targetId, index) => {
            const targetElement = document.getElementById(targetId);
            if (targetElement && index < values.length) {
                targetElement.value = formatValue(values[index]);
            }
        });
    }
    
    return hasValidValues;
}

/**
 * Helper to sync FK results to IK inputs
 * @returns {boolean} Whether sync was successful
 */
export function syncForwardToInverseInputs() {
    const sourceSuffixes = ['x-result', 'y-result', 'z-result', 'thetaX-result', 'thetaY-result', 'thetaZ-result'];
    const targetIds = ['pos-x', 'pos-y', 'pos-z', 'orient-x', 'orient-y', 'orient-z'];
    
    return syncValues(sourceSuffixes, targetIds);
}

/**
 * Helper to sync IK results to FK inputs
 * @returns {boolean} Whether sync was successful
 */
export function syncInverseToForwardInputs() {
    const sourceSuffixes = Array.from({length: 6}, (_, i) => `ik-angle${i+1}-result`);
    const targetIds = Array.from({length: 6}, (_, i) => `angle${i+1}`);
    
    return syncValues(sourceSuffixes, targetIds);
} 