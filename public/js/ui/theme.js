/**
 * Theme management module
 */

import { updateAutoCalcStyles } from './inputs.js';
import { refreshErrorRateColors } from './error.js';

// Theme constants
export const THEME_LIGHT = 'light';
export const THEME_DARK = 'dark';
export const THEME_AUTO = 'auto';

// Get saved theme setting or use auto as default
let currentThemeSetting = localStorage.getItem('theme') || THEME_AUTO;

/**
 * Determine if dark mode should be active based on setting and system preference
 * @returns {boolean} Whether dark mode should be active
 */
export function isDarkModeActive() {
    if (currentThemeSetting === THEME_DARK) {
        return true;
    }
    if (currentThemeSetting === THEME_LIGHT) {
        return false;
    }
    // Auto mode: check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Apply dark mode styles
 */
function applyDarkModeStyles() {
    let darkModeStyle = document.getElementById('dark-mode-styles');
    if (!darkModeStyle) {
        darkModeStyle = document.createElement('link');
        darkModeStyle.id = 'dark-mode-styles';
        darkModeStyle.rel = 'stylesheet';
        darkModeStyle.href = 'css/dark-mode.css';
        document.head.appendChild(darkModeStyle);
    }
    document.querySelector('.theme-toggle')?.classList.add('dark-mode-applied');
    document.body.classList.add('dark-mode-applied'); // Add class to body element
    console.log('Dark mode styles applied');
}

/**
 * Remove dark mode styles
 */
function removeDarkModeStyles() {
    const darkModeStyle = document.getElementById('dark-mode-styles');
    if (darkModeStyle) {
        darkModeStyle.remove();
    }
    document.querySelector('.theme-toggle')?.classList.remove('dark-mode-applied');
    document.body.classList.remove('dark-mode-applied'); // Remove class from body element
    console.log('Dark mode styles removed');
}

/**
 * Apply theme based on current state
 */
export function applyTheme() {
    const themeSlider = document.getElementById('theme-slider');
    const isDark = isDarkModeActive();
    
    if (isDark) {
        applyDarkModeStyles();
        if (themeSlider) themeSlider.classList.replace('light', 'dark'); // Set slider to dark
    } else {
        removeDarkModeStyles();
        if (themeSlider) themeSlider.classList.replace('dark', 'light'); // Set slider to light
    }
    
    // Only save if the user explicitly clicked (not auto)
    if (currentThemeSetting !== THEME_AUTO) {
        localStorage.setItem('theme', currentThemeSetting);
    } else {
        // If in auto mode, we don't explicitly save 'auto', 
        // but we clear any previously forced setting if it exists
        localStorage.removeItem('theme'); 
    }
    
    // Update button styles to reflect new theme
    try {
        updateAutoCalcStyles();
        
        // Refresh error rate colors
        refreshErrorRateColors();
    } catch (error) {
        console.error("Error updating styles after theme change:", error);
    }
}

/**
 * Cycle through themes (Light <-> Dark)
 */
export function cycleTheme() {
    // When clicking, we move away from 'auto' permanently for this session
    const isCurrentlyDark = isDarkModeActive();

    if (isCurrentlyDark) {
        currentThemeSetting = THEME_LIGHT; // If dark, switch to light
    } else {
        currentThemeSetting = THEME_DARK; // If light, switch to dark
    }
    
    applyTheme();
}

/**
 * Setup theme toggle button
 */
function setupThemeToggle() {
    const themeToggleButton = document.getElementById('theme-toggle-button');
    
    if (themeToggleButton) {
        // Initialize slider state correctly
        if (isDarkModeActive()) {
             themeToggleButton.querySelector('.theme-slider')?.classList.add('dark');
             themeToggleButton.querySelector('.theme-slider')?.classList.remove('light');
        } else {
             themeToggleButton.querySelector('.theme-slider')?.classList.add('light');
             themeToggleButton.querySelector('.theme-slider')?.classList.remove('dark');
        }
        
        themeToggleButton.addEventListener('click', cycleTheme);
    }
}

/**
 * Initialize theme manager
 */
export function initializeTheme() {
    // Setup theme toggle
    setupThemeToggle();
    
    // Listen for system theme changes ONLY if current setting is AUTO
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (currentThemeSetting === THEME_AUTO) {
            applyTheme(); // Re-apply theme to reflect system change
        }
    });
    
    // Apply initial theme based on setting/system
    applyTheme();
} 