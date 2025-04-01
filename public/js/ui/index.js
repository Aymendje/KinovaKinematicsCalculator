/**
 * Main UI module that coordinates all UI functionality
 */

// Import submodules
import * as Theme from './theme.js';
import * as Tabs from './tabs.js';
import * as Error from './error.js';
import * as Inputs from './inputs.js';
import * as Sync from './sync.js';
import * as Visualization from './visualization.js';
import * as Presets from './presets.js';
import * as Language from './language.js';

/**
 * Initialize the UI system
 */
export function initialize() {
    console.log('Initializing UI system...');
    
    // Initialize tabs
    Tabs.initializeTabs();
    
    // Initialize theme manager
    Theme.initializeTheme();
    
    // Initialize language toggle
    Language.initializeLangToggle();
    
    // Set up input handlers (this will also set up auto buttons)
    Inputs.setupInputHandlers();
    
    // Ensure auto buttons are set up (in case setupInputHandlers doesn't run properly)
    Inputs.setupAutoCalculateButtons();
    
    console.log('UI system initialized');
}

// Re-export all the module functions for external use
export {
    // Theme
    Theme,
    
    // Tabs
    Tabs,
    
    // Error handling
    Error,
    
    // Input handling
    Inputs,
    
    // Sync
    Sync,
    
    // Visualization
    Visualization,
    
    // Presets
    Presets,
    
    // Language
    Language
}; 