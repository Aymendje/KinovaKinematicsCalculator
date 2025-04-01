/**
 * Translation module for language management
 */

// Global translations object
let translations = {};

/**
 * Load translations from JSON file
 * @param {string} lang - Language code (e.g., 'en', 'fr')
 * @returns {Promise} - Promise that resolves when translations are loaded
 */
async function loadTranslations(lang) {
    try {
        const response = await fetch(`./lang/${lang}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        translations = await response.json();
        console.log(`Translations for ${lang} loaded successfully.`);
    } catch (error) {
        console.error(`Could not load translations for ${lang}:`, error);
        // Fallback or default handling can be added here
        translations = {}; // Reset to empty to avoid errors
    }
}

/**
 * Apply translations to DOM elements
 */
function applyTranslations() {
    if (!translations) {
        console.error("Translations not loaded.");
        return;
    }

    document.querySelectorAll('[data-translate-key]').forEach(element => {
        const key = element.getAttribute('data-translate-key');
        element.textContent = translations[key] || element.textContent; // Keep original if key not found
    });

    document.querySelectorAll('[data-translate-title-key]').forEach(element => {
        const key = element.getAttribute('data-translate-title-key');
        element.title = translations[key] || element.title;
    });

    // Special case for page title
    const titleElement = document.querySelector('title[data-translate-key]');
    if (titleElement) {
        const key = titleElement.getAttribute('data-translate-key');
        document.title = translations[key] || document.title;
    }
}

/**
 * Get translation for a specific key
 * @param {string} key - Translation key
 * @returns {string} - Translated text or the key itself if not found
 */
function getTranslation(key) {
    return translations[key] || key;
}

/**
 * Helper function to get IK error message key based on error value
 * @param {number} errorValue - Error value to determine message key
 * @returns {string} - Translation key for error message
 */
function getIKErrorMessageKey(errorValue) {
    if (errorValue < 0.001) {
        return 'ikErrorSuccess'; // Key for successful message
    } else if (errorValue < 1) {
        return 'ikErrorWarning'; // Key for warning message
    } else {
        return 'ikErrorFailure'; // Key for failure message
    }
}

// Export functionality
export {
    loadTranslations,
    applyTranslations,
    getTranslation,
    getIKErrorMessageKey
}; 