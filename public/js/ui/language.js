/**
 * Language module for handling translations and language switching
 */

import { loadTranslations, applyTranslations, getTranslation } from '../translation.js';
import { updateAutoCalcStyles } from './inputs.js';

/**
 * Restore UI elements that might have been affected by translation
 */
function restoreUIAfterTranslation() {
    // Ensure auto-calculation buttons are preserved
    const calculateBtn = document.getElementById('calculate-btn');
    const calculateIkBtn = document.getElementById('calculate-ik-btn');
    
    // Check if buttons lost their auto elements
    if (calculateBtn && !calculateBtn.querySelector('.auto-calc-checkbox')) {
        const btnText = calculateBtn.textContent.trim();
        calculateBtn.innerHTML = `
            <span>${btnText}</span>
            <label class="auto-calc-label">
                <input type="checkbox" id="auto-calc-fk" class="auto-calc-checkbox">
                <span class="checkbox-label">Auto</span>
            </label>
        `;
        calculateBtn.style.display = 'flex';
        calculateBtn.style.alignItems = 'center';
        calculateBtn.style.justifyContent = 'space-between';
        
        // Re-attach the event listener
        const autoCalcFKCheckbox = document.getElementById('auto-calc-fk');
        if (autoCalcFKCheckbox) {
            const isAutoCalculateEnabled = window.app?.isAutoCalculateEnabled === true;
            autoCalcFKCheckbox.checked = isAutoCalculateEnabled;
            autoCalcFKCheckbox.addEventListener('change', (e) => {
                window.app.isAutoCalculateEnabled = e.target.checked;
                console.log(`Auto-calculation ${window.app.isAutoCalculateEnabled ? 'enabled' : 'disabled'}`);
                // Sync the other checkbox state immediately
                const ikCheckbox = document.getElementById('auto-calc-ik');
                if (ikCheckbox) ikCheckbox.checked = window.app.isAutoCalculateEnabled;
                // Update styles for both
                updateAutoCalcStyles();
            });
        }
    }
    
    if (calculateIkBtn && !calculateIkBtn.querySelector('.auto-calc-checkbox')) {
        const btnText = calculateIkBtn.textContent.trim();
        calculateIkBtn.innerHTML = `
            <span>${btnText}</span>
            <label class="auto-calc-label">
                <input type="checkbox" id="auto-calc-ik" class="auto-calc-checkbox">
                <span class="checkbox-label">Auto</span>
            </label>
        `;
        calculateIkBtn.style.display = 'flex';
        calculateIkBtn.style.alignItems = 'center';
        calculateIkBtn.style.justifyContent = 'space-between';
        
        // Re-attach the event listener
        const autoCalcIKCheckbox = document.getElementById('auto-calc-ik');
        if (autoCalcIKCheckbox) {
            const isAutoCalculateEnabled = window.app?.isAutoCalculateEnabled === true;
            autoCalcIKCheckbox.checked = isAutoCalculateEnabled;
            autoCalcIKCheckbox.addEventListener('change', (e) => {
                window.app.isAutoCalculateEnabled = e.target.checked;
                console.log(`Auto-calculation ${window.app.isAutoCalculateEnabled ? 'enabled' : 'disabled'}`);
                // Sync the other checkbox state immediately
                const fkCheckbox = document.getElementById('auto-calc-fk');
                if (fkCheckbox) fkCheckbox.checked = window.app.isAutoCalculateEnabled;
                // Update styles for both
                updateAutoCalcStyles();
            });
        }
    }
    
    // Restore click handlers
    if (calculateBtn) {
        calculateBtn.addEventListener('click', (e) => {
            if (e.target.id !== 'auto-calc-fk' && e.target.className !== 'checkbox-label') {
                if (window.app && window.app.calculateForwardKinematics) {
                    window.app.calculateForwardKinematics().catch(err => 
                        console.error("Error in FK calculation:", err)
                    );
                }
            }
        });
    }
    
    if (calculateIkBtn) {
        calculateIkBtn.addEventListener('click', (e) => {
            if (e.target.id !== 'auto-calc-ik' && e.target.className !== 'checkbox-label') {
                if (window.app && window.app.calculateInverseKinematics) {
                    window.app.calculateInverseKinematics().catch(err => 
                        console.error("Error in IK calculation:", err)
                    );
                }
            }
        });
    }
    
    // Update checkbox and button styles
    updateAutoCalcStyles();
}

/**
 * Initialize language toggle
 */
export function initializeLangToggle() {
    const langToggleButton = document.getElementById('lang-toggle');
    
    // Determine initial language based on browser locale
    const browserLang = navigator.language || navigator.userLanguage; // Get browser language
    let currentLang = 'EN'; // Default to English
    if (browserLang && browserLang.toLowerCase().startsWith('fr')) {
        currentLang = 'FR'; // Set to French if browser lang is French
    }
    
    if (langToggleButton) {
        // Set initial button state
        langToggleButton.textContent = currentLang;
        langToggleButton.title = (currentLang === 'FR') ? 
            getTranslation('langToggleTitleFr') : 
            getTranslation('langToggleTitleEn');

        // Function to toggle language
        function toggleLanguage() {
            if (currentLang === 'FR') {
                currentLang = 'EN';
                langToggleButton.textContent = currentLang;
                langToggleButton.title = getTranslation('langToggleTitleEn');
                // Load and apply English translations
                loadTranslations('en')
                    .then(() => {
                        applyTranslations();
                        // Restore UI elements that might have been affected
                        restoreUIAfterTranslation();
                        console.log('Language switched to English');
                    })
                    .catch(error => {
                        console.error('Failed to load English translations:', error);
                    });
            } else {
                currentLang = 'FR';
                langToggleButton.textContent = currentLang;
                langToggleButton.title = getTranslation('langToggleTitleFr');
                // Load and apply French translations
                loadTranslations('fr')
                    .then(() => {
                        applyTranslations();
                        // Restore UI elements that might have been affected
                        restoreUIAfterTranslation();
                        console.log('Language switched to French');
                    })
                    .catch(error => {
                        console.error('Failed to load French translations:', error);
                        // Fall back to English if French fails
                        currentLang = 'EN';
                        langToggleButton.textContent = currentLang;
                        langToggleButton.title = getTranslation('langToggleTitleEn');
                        loadTranslations('en')
                            .then(() => {
                                applyTranslations();
                                restoreUIAfterTranslation();
                                console.log('Fell back to English');
                            });
                    });
            }
        }
        
        // Add click listener
        langToggleButton.addEventListener('click', toggleLanguage);
    }
} 