/**
 * Utility to access CSS color variables from JavaScript
 */

/**
 * Get a CSS variable value
 * @param {string} varName - CSS variable name (without the -- prefix)
 * @param {Element} [element=document.documentElement] - Element to get the variable from
 * @returns {string} The value of the CSS variable
 */
function getCssVar(varName, element = document.documentElement) {
    return getComputedStyle(element).getPropertyValue(`--${varName}`).trim();
}

/**
 * Color constants for the application
 */

const colors = {
    // Theme colors
    BACKGROUND: {
        get LIGHT() { return getCssVar('background-light'); },
        get DARK() { return getCssVar('background-dark'); }
    },
    TEXT: {
        PRIMARY: {
            get LIGHT() { return getCssVar('text-primary-light'); },
            get DARK() { return getCssVar('text-primary-dark'); }
        },
        SECONDARY: {
            get LIGHT() { return getCssVar('text-secondary-light'); },
            get DARK() { return getCssVar('text-secondary-dark'); }
        },
        LINK: {
            get LIGHT() { return getCssVar('text-link-light'); },
            get DARK() { return getCssVar('text-link-dark'); }
        }
    },
    BORDER: {
        get LIGHT() { return getCssVar('border-light'); },
        get DARK() { return getCssVar('border-dark'); }
    },

    // Status colors - Success
    SUCCESS: {
        TEXT: {
            get LIGHT() { return getCssVar('success-text-light'); },
            get DARK() { return getCssVar('success-text-dark'); }
        },
        BG: {
            get LIGHT() { return getCssVar('success-bg-light'); },
            get DARK() { return getCssVar('success-bg-dark'); }
        },
        BORDER: {
            get LIGHT() { return getCssVar('success-border-light'); },
            get DARK() { return getCssVar('success-border-dark'); }
        }
    },

    // Status colors - Warning
    WARNING: {
        TEXT: {
            get LIGHT() { return getCssVar('warning-text-light'); },
            get DARK() { return getCssVar('warning-text-dark'); }
        },
        BG: {
            get LIGHT() { return getCssVar('warning-bg-light'); },
            get DARK() { return getCssVar('warning-bg-dark'); }
        },
        BORDER: {
            get LIGHT() { return getCssVar('warning-border-light'); },
            get DARK() { return getCssVar('warning-border-dark'); }
        }
    },

    // Status colors - Error
    ERROR: {
        TEXT: {
            get LIGHT() { return getCssVar('error-text-light'); },
            get DARK() { return getCssVar('error-text-dark'); }
        },
        BG: {
            get LIGHT() { return getCssVar('error-bg-light'); },
            get DARK() { return getCssVar('error-bg-dark'); }
        },
        BORDER: {
            get LIGHT() { return getCssVar('error-border-light'); },
            get DARK() { return getCssVar('error-border-dark'); }
        }
    },

    // Button colors
    BUTTON: {
        DISABLED: {
            LIGHT: {
                get BG() { return getCssVar('button-disabled-bg-light'); },
                get BORDER() { return getCssVar('button-disabled-border-light'); }
            },
            DARK: {
                get BG() { return getCssVar('button-disabled-bg-dark'); },
                get BORDER() { return getCssVar('button-disabled-border-dark'); }
            }
        },
        HOVER: {
            get LIGHT() { return getCssVar('button-hover-light'); },
            get DARK() { return getCssVar('button-hover-dark'); }
        }
    },

    // Theme toggle colors
    THEME_TOGGLE: {
        get LIGHT() { return getCssVar('theme-toggle-light'); },
        get DARK() { return getCssVar('theme-toggle-dark'); }
    }
};

export default colors; 