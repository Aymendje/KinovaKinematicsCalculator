/**
 * UI module for managing the user interface
 * This file now serves as a compatibility layer to the new modular UI structure
 */

import * as UI from './ui/index.js';

// Initialize the UI system using the new modular approach
document.addEventListener('DOMContentLoaded', () => {
    // First, explicitly set up the auto buttons immediately
    UI.Inputs.setupAutoCalculateButtons();
    
    // Then initialize the rest of the UI components
    UI.initialize();
});

// Also add a window load event to ensure auto buttons are set up
// This runs after all resources have loaded, giving us one more chance
window.addEventListener('load', () => {
    console.log('Window loaded - ensuring auto buttons are set up');
    UI.Inputs.setupAutoCalculateButtons();
    
    // Force update the styles as well
    UI.Inputs.updateAutoCalcStyles();
});

// Export all the functions from our modular UI system for backward compatibility
// Theme functionality
export const isDarkModeActive = UI.Theme.isDarkModeActive;

// Error handling
export const refreshErrorRateColors = UI.Error.refreshErrorRateColors;
export const handleCalculationError = UI.Error.handleCalculationError;

// Input handling
export const isAutoCalculateEnabled = UI.Inputs.isAutoCalculateEnabled;
export const updateCalculateButtonStyle = UI.Inputs.updateCalculateButtonStyle;
export const handleAngleInputBlur = UI.Inputs.handleAngleInputBlur;
export const handlePositionInputBlur = UI.Inputs.handlePositionInputBlur;
export const updateAutoCalcStyles = UI.Inputs.updateAutoCalcStyles;
export const setupInputHandlers = UI.Inputs.setupInputHandlers;
export const setupAutoCalculateButtons = UI.Inputs.setupAutoCalculateButtons;

// Tab functionality  
export const initializeTabs = UI.Tabs.initializeTabs;

// Sync functionality
export const syncForwardToInverseInputs = UI.Sync.syncForwardToInverseInputs;
export const syncInverseToForwardInputs = UI.Sync.syncInverseToForwardInputs;

// Preset loading
export const loadPreset = UI.Presets.loadPreset;
export const loadPosePreset = UI.Presets.loadPosePreset;

// Language functionality
export const initializeLangToggle = UI.Language.initializeLangToggle;

// Visualization
export const setRobotVisualization = UI.Visualization.setRobotVisualization;
export const getRobotVisualization = UI.Visualization.getRobotVisualization;

// For backward compatibility
export function initializeThemeManager() {
    UI.Theme.initializeTheme();
} 