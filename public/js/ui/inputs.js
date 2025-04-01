/**
 * Input handling module
 */

import { clampValue } from '../helper.js';
import { isDarkModeActive } from './theme.js';
import colors from '../colors.js';

// Auto-calculation state
export function isAutoCalculateEnabled() {
    return window.app && window.app.isAutoCalculateEnabled === true;
}

export function setAutoCalculateEnabled(value) {
    if (window.app) {
        window.app.isAutoCalculateEnabled = Boolean(value);
    }
    resetCalculateButtonStyle();
}

/**
 * Update calculation button style
 * @param {string} buttonId - ID of the button to update
 * @param {boolean} isSet - Whether the button is set (grayed out or not)
 */
function updateButtonStyle(buttonId, isSet = false) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    // Apply gray style only if auto-calc is OFF and inputs haven't changed
    if (isSet) {
        // Check if dark mode is active
        const isDarkMode = isDarkModeActive();
        if (isDarkMode) {
            button.style.backgroundColor = colors.BUTTON.DISABLED.DARK.BG; 
            button.style.borderColor = colors.BUTTON.DISABLED.DARK.BORDER;
        } else {
            button.style.backgroundColor = colors.BUTTON.DISABLED.LIGHT.BG;
            button.style.borderColor = colors.BUTTON.DISABLED.LIGHT.BORDER;
        }
    } else {
        button.style.backgroundColor = ''; // Reset to default
        button.style.borderColor = '';
    }
}

/**
 * Update FK button style when inputs change
 */
export function updateCalculateButtonStyle(isSet = false) {
    updateCalculateButtonStyle.lastState = isSet;
    if (isAutoCalculateEnabled() == false) {
        updateButtonStyle('calculate-btn', isSet);
        updateButtonStyle('calculate-ik-btn', isSet);
    }
}

function resetCalculateButtonStyle() {
    updateCalculateButtonStyle(updateCalculateButtonStyle.lastState || false);
}

/**
 * Generic handler for input blur events
 * @param {Event} event - Blur event
 * @param {Function} calculateFn - Calculation function to call
 * @param {Object} options - Additional options
 * @param {number} options.min - Minimum value (for clamping)
 * @param {number} options.max - Maximum value (for clamping)
 * @param {boolean} options.allowComma - Whether to allow comma as decimal separator
 */
function handleInputBlur(event, calculateFn, options = {}) {
    const input = event.target;
    const value = parseFloat(options.allowComma ? input.value.replace(',', '.') : input.value);
    
    if (!isNaN(value)) {
        // Clamp the value if min/max are provided
        let finalValue = value;
        if (options.min !== undefined && options.max !== undefined) {
            finalValue = clampValue(value, options.min, options.max);
        }
        
        // Always format to 2 decimal places
        input.value = finalValue.toFixed(2);
        
        // Trigger calculation if auto-calculation is enabled
        if (isAutoCalculateEnabled()) {
            if (window.app && calculateFn) {
                calculateFn().catch(err => 
                    console.error(`Error in auto calculation after formatting:`, err)
                );
            }
        } 
    } else {
        input.value = "0.00";
    }
}

/**
 * Handle angle input blur event
 * @param {Event} event - Blur event
 */
export function handleAngleInputBlur(event) {
    const prevValue = event.target.dataset.prevValue || "0.00";
    handleInputChange(event, prevValue);
    
    handleInputBlur(event, 
        window.app?.calculateForwardKinematics, 
        { min: -360, max: 360 }
    );
}

/**
 * Handle position input blur event
 * @param {Event} event - Blur event
 */
export function handlePositionInputBlur(event) {
    const prevValue = event.target.dataset.prevValue || "0.00";
    handleInputChange(event, prevValue);
    
    handleInputBlur(event, 
        window.app?.calculateInverseKinematics, 
        { allowComma: true }
    );
}

/**
 * Handle input change event
 * @param {Event} event - Change event
 * @param {string} previousValue - Previous value
 */
function handleInputChange(event, previousValue) {
    const currentValue = parseFloat(event.target.value).toFixed(2);
    previousValue = parseFloat(previousValue).toFixed(2);
    if (currentValue != previousValue) {
        updateCalculateButtonStyle(false);
    }
}

/**
 * Update auto-calculation styles for both buttons
 */
export function updateAutoCalcStyles() {
    const fkButton = document.getElementById('calculate-btn');
    const ikButton = document.getElementById('calculate-ik-btn');
    const fkCheckbox = document.getElementById('auto-calc-fk');
    const ikCheckbox = document.getElementById('auto-calc-ik');
    const fkLabel = fkCheckbox?.closest('.auto-calc-label');
    const ikLabel = ikCheckbox?.closest('.auto-calc-label');

    const buttons = [fkButton, ikButton];
    const labels = [fkLabel, ikLabel];
    
    // Check if dark mode is active
    const isDarkMode = isDarkModeActive();

    buttons.forEach(button => {
        if (!button) return;
        if (isAutoCalculateEnabled()) {
            if (isDarkMode) {
                button.style.backgroundColor = colors.SUCCESS.BG.DARK;
                button.style.borderColor = colors.SUCCESS.BORDER.DARK;
                button.style.color = colors.SUCCESS.TEXT.DARK;
            } else {
                button.style.backgroundColor = colors.SUCCESS.BG.LIGHT;
                button.style.borderColor = colors.SUCCESS.BORDER.LIGHT;
                button.style.color = colors.SUCCESS.TEXT.LIGHT;
            }
        } else {
            // Reset to default button styling
            button.style.backgroundColor = '';
            button.style.borderColor = '';
            button.style.color = '';
        }
    });

    labels.forEach(label => {
        if (!label) return;
        if (isAutoCalculateEnabled()) {
            label.classList.add('auto-calc-active');
        } else {
            label.classList.remove('auto-calc-active');
        }
    });

    // Ensure checkbox states are synced
    if (fkCheckbox) fkCheckbox.checked = isAutoCalculateEnabled();
    if (ikCheckbox) ikCheckbox.checked = isAutoCalculateEnabled();
    resetCalculateButtonStyle();
}

/**
 * Ensure calculate buttons have the auto checkbox UI
 */
export function setupAutoCalculateButtons() {
    console.log('Setting up auto-calculate buttons');
    
    // Use setTimeout to ensure DOM is fully processed
    setTimeout(() => {
        // Find FK checkbox and attach listener
        const fkCheckboxInput = document.getElementById('auto-calc-fk');
        const calculateBtn = document.getElementById('calculate-btn'); // Needed for context perhaps?

        if (fkCheckboxInput && calculateBtn && !fkCheckboxInput.dataset.listenerAttached) { // Check if listener already attached
            console.log('Attaching listener to existing FK auto checkbox');
            fkCheckboxInput.checked = isAutoCalculateEnabled(); // Set initial state
            
            fkCheckboxInput.addEventListener('change', (e) => {
                setAutoCalculateEnabled(e.target.checked);
                console.log(`Auto-calculation ${isAutoCalculateEnabled() ? 'enabled' : 'disabled'}`);
                
                // Sync the other checkbox state immediately
                const ikCheckbox = document.getElementById('auto-calc-ik');
                if (ikCheckbox) ikCheckbox.checked = isAutoCalculateEnabled();
                
                // Update styles for both
                updateAutoCalcStyles();
            });
            fkCheckboxInput.dataset.listenerAttached = 'true'; // Mark as attached
            console.log('FK auto checkbox listener attached');
        }
        
        // Find IK checkbox and attach listener
        const ikCheckboxInput = document.getElementById('auto-calc-ik');
        const calculateIkBtn = document.getElementById('calculate-ik-btn'); // Needed for context perhaps?

        if (ikCheckboxInput && calculateIkBtn && !ikCheckboxInput.dataset.listenerAttached) { // Check if listener already attached
            console.log('Attaching listener to existing IK auto checkbox');
            ikCheckboxInput.checked = isAutoCalculateEnabled(); // Set initial state

            ikCheckboxInput.addEventListener('change', (e) => {
                setAutoCalculateEnabled(e.target.checked);
                console.log(`Auto-calculation ${isAutoCalculateEnabled() ? 'enabled' : 'disabled'}`);
                
                // Sync the other checkbox state immediately
                const fkCheckbox = document.getElementById('auto-calc-fk');
                if (fkCheckbox) fkCheckbox.checked = isAutoCalculateEnabled();
                
                // Update styles for both
                updateAutoCalcStyles();
            });
            ikCheckboxInput.dataset.listenerAttached = 'true'; // Mark as attached
            console.log('IK auto checkbox listener attached');
        }
        
        // Initial style update after attaching listeners
        updateAutoCalcStyles();
        
    }, 0); // Delay of 0ms ensures this runs after current execution cycle
}

/**
 * Set up input handlers for all input fields
 */
export function setupInputHandlers() {
    // First ensure the auto buttons are set up
    setupAutoCalculateButtons();
    
    // Forward kinematics angle inputs
    for (let i = 1; i <= 6; i++) {
        const angleInput = document.getElementById(`angle${i}`);
        if (angleInput) {
            // Save value on focus
            angleInput.addEventListener('focus', (e) => {
                e.target.dataset.prevValue = e.target.value || "0.00";
            });
            angleInput.addEventListener('blur', handleAngleInputBlur);
        }
    }
    
    // Inverse kinematics position inputs
    const positionInputs = ['pos-x', 'pos-y', 'pos-z', 'orient-x', 'orient-y', 'orient-z'];
    positionInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            // Save value on focus
            input.addEventListener('focus', (e) => {
                e.target.dataset.prevValue = e.target.value || "0.00";
            });
            input.addEventListener('blur', handlePositionInputBlur);
        }
    });
    
    // Set up calculation buttons
    const calculateBtn = document.getElementById('calculate-btn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', (e) => {
            // Skip if clicking on the auto checkbox or its label
            if (e.target.id !== 'auto-calc-fk' && e.target.className !== 'checkbox-label') {
                if (window.app && window.app.calculateForwardKinematics) {
                    window.app.calculateForwardKinematics().catch(err => 
                        console.error("Error in FK calculation:", err)
                    );
                }
            }
        });
    }
    
    const calculateIkBtn = document.getElementById('calculate-ik-btn');
    if (calculateIkBtn) {
        calculateIkBtn.addEventListener('click', (e) => {
            // Skip if clicking on the auto checkbox or its label
            if (e.target.id !== 'auto-calc-ik' && e.target.className !== 'checkbox-label') {
                if (window.app && window.app.calculateInverseKinematics) {
                    window.app.calculateInverseKinematics().catch(err => 
                        console.error("Error in IK calculation:", err)
                    );
                }
            }
        });
    }
} 