/**
 * Main application file
 */

// Import the Robot Visualization class
import { RobotVisualization } from './robot-visualization.js';

// Import modules
import { 
    loadTranslations, 
    applyTranslations,
    getTranslation
} from './translation.js';


import { 
    angular2cartesian, 
    calculateForwardKinematics as coreCalculateFK,
} from './forwardk.js';

import { 
    cartesian2angular,
    calculateInverseKinematics as coreCalculateIK
} from './inversek.js';

import {
    createPosition,
    degreesToRadians,
    setErrorBasedColor,
    setErrorBasedBgColor,
    setErrorBasedResultBoxColor
} from './helper.js';

import {
    initializeTabs,
    initializeThemeManager,
    initializeLangToggle,
    loadPreset,
    loadPosePreset,
    updateAutoCalcStyles,
    updateCalculateButtonStyle,
    handleAngleInputBlur,
    setRobotVisualization,
    getRobotVisualization,
    isAutoCalculateEnabled,
    handlePositionInputBlur,
    setupAutoCalculateButtons
} from './ui.js';

import { hideLoader } from './spinner.js';

// Initialize the application
async function initializeApp() {
    console.log('Initializing application...');

    // Load translations based on browser language
    const browserLang = navigator.language || navigator.userLanguage;
    const langToUse = (browserLang && browserLang.toLowerCase().startsWith('fr')) ? 'fr' : 'en';
    
    try {
        await loadTranslations(langToUse);
        console.log(`Loaded initial language: ${langToUse}`);
    } catch (error) {
        console.error(`Failed to load language ${langToUse}, falling back to English:`, error);
        await loadTranslations('en'); // Default fallback
    }
    applyTranslations(); // Apply them to the static elements

    // Cache frequently used DOM elements
    const angleInputs = Array.from({ length: 6 }, (_, i) => document.getElementById(`angle${i + 1}`));
    
    // Format initial input values to show 0.00 instead of 0
    for (let i = 1; i <= 6; i++) {
        const angleInput = document.getElementById(`angle${i}`);
        if (angleInput && (angleInput.value === '0' || angleInput.value === '' || angleInput.value === '0.0')) {
            angleInput.value = '0.00';
        }
    }
    
    // Format initial position input values
    const posInputs = ['pos-x', 'pos-y', 'pos-z', 'orient-x', 'orient-y', 'orient-z'];
    posInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input && (input.value === '0' || input.value === '' || input.value === '0.0')) {
            input.value = '0.00';
        }
    });

    // Initialize result fields with 0.00 instead of dashes
    const fkResults = ['x-result', 'y-result', 'z-result', 'thetaX-result', 'thetaY-result', 'thetaZ-result'];
    fkResults.forEach(id => {
        const result = document.getElementById(id);
        if (result && result.textContent === '-') {
            result.textContent = '0.00';
        }
    });
    
    const ikResults = ['ik-angle1-result', 'ik-angle2-result', 'ik-angle3-result', 
                       'ik-angle4-result', 'ik-angle5-result', 'ik-angle6-result'];
    ikResults.forEach(id => {
        const result = document.getElementById(id);
        if (result && result.textContent === '-') {
            result.textContent = '0.00';
        }
    });
    
    // Also update error rate displays
    const fkErrorRate = document.getElementById('fk-error-rate');
    if (fkErrorRate && fkErrorRate.textContent === '-') {
        fkErrorRate.textContent = '0.00';
    }
    
    const ikErrorRate = document.getElementById('ik-position-error');
    if (ikErrorRate && ikErrorRate.textContent === '-') {
        ikErrorRate.textContent = '0.00';
    }

    // Ensure prefixes are applied after setting the initial values
    applyTranslations();

    // Initialize dark mode
    initializeThemeManager();
    
    // Initialize Tabs
    initializeTabs();
    
    // Set up auto calculate buttons (in case they weren't set up)
    setupAutoCalculateButtons();

    // Get button element after it has been set up
    const calculateBtn = document.getElementById('calculate-btn');
    
    // Setup Forward Kinematics calculation button click
    if (calculateBtn) {
        calculateBtn.addEventListener('click', (e) => {
            // Only trigger calculation if the click wasn't on the checkbox
            if (e.target.id !== 'auto-calc-fk' && e.target.className !== 'checkbox-label') {
                calculateForwardKinematics().catch(err => 
                    console.error("Error in FK calculation:", err)
                );
            }
        });
    } else {
        console.log("FK button not found - waiting for UI module to create it");
    }
    
    // Get button element after it has been set up
    const calculateIkBtn = document.getElementById('calculate-ik-btn');
    
    // Setup Inverse Kinematics calculation button click
    if (calculateIkBtn) {
        calculateIkBtn.addEventListener('click', (e) => {
            // Only trigger calculation if the click wasn't on the checkbox
            if (e.target.id !== 'auto-calc-ik' && e.target.className !== 'checkbox-label') {
                calculateInverseKinematics().catch(err => 
                    console.error("Error in IK calculation:", err)
                );
            }
        });
    } else {
        console.log("IK button not found - waiting for UI module to create it");
    }
    
    // Add input listeners to update button styles when values change
    // and trigger calculation if auto-calculation is enabled
    const fkInputChangeHandler = (e) => {
        if (isAutoCalculateEnabled()) {
            calculateForwardKinematics().catch(err => 
                console.error("Error in auto FK calculation:", err)
            );
        }
    };
    
    const ikInputChangeHandler = (e) => {
        if (isAutoCalculateEnabled()) {
            calculateInverseKinematics().catch(err => 
                console.error("Error in auto IK calculation:", err)
            );
        }
    };
    
    // Call once after setting up listeners to set initial styles/checkbox states
    updateAutoCalcStyles();

    // Add listeners for FK inputs
    for (let i = 1; i <= 6; i++) {
        document.getElementById(`angle${i}`).addEventListener('input', fkInputChangeHandler);
    }
    
    // Add blur event listeners for angle inputs to handle auto-clamping
    for (let i = 1; i <= 6; i++) {
        document.getElementById(`angle${i}`).addEventListener('blur', handleAngleInputBlur);
    }
    
    // Add listeners for IK inputs
    document.getElementById('pos-x').addEventListener('input', ikInputChangeHandler);
    document.getElementById('pos-y').addEventListener('input', ikInputChangeHandler);
    document.getElementById('pos-z').addEventListener('input', ikInputChangeHandler);
    document.getElementById('orient-x').addEventListener('input', ikInputChangeHandler);
    document.getElementById('orient-y').addEventListener('input', ikInputChangeHandler);
    document.getElementById('orient-z').addEventListener('input', ikInputChangeHandler);
    
    // Add blur event listeners for position/orientation inputs to handle formatting
    document.getElementById('pos-x').addEventListener('blur', handlePositionInputBlur);
    document.getElementById('pos-y').addEventListener('blur', handlePositionInputBlur);
    document.getElementById('pos-z').addEventListener('blur', handlePositionInputBlur);
    document.getElementById('orient-x').addEventListener('blur', handlePositionInputBlur);
    document.getElementById('orient-y').addEventListener('blur', handlePositionInputBlur);
    document.getElementById('orient-z').addEventListener('blur', handlePositionInputBlur);

    // --- INITIALIZE VISUALIZATION ---
    try {
        console.log("Attempting to initialize RobotVisualization...");
        const visualization = new RobotVisualization('robot-visualization-container');
        setRobotVisualization(visualization);
        console.log("RobotVisualization initialized successfully.");
    } catch (error) {
        console.error("Failed to initialize RobotVisualization:", error);
        const vizContainer = document.getElementById('robot-visualization-container');
        if (vizContainer) {
            vizContainer.innerHTML = '<p style="color: red; padding: 10px;">Erreur initialisation visualisation 3D. Vérifiez la console.</p>';
        }
    }
    // ------------------------------

    // Initialize language toggle
    initializeLangToggle();

    // Perform initial Forward Kinematics calculation
    console.log("Performing initial forward kinematics calculation...");
    await calculateForwardKinematics()
        .then(() => {
            console.log("Initial calculation complete.");
            // Ensure translations are applied after the initial calculation
            applyTranslations();
        })
        .catch(err => {
            console.error("Error in initial FK calculation:", err);
            // Apply translations even if there was an error
            applyTranslations();
        });
    
    // Hide the loader when initialization is complete
    hideLoader();
}

// Define UI-updating wrapper for FK calculation
async function calculateForwardKinematics(anglesDeg = null) {
    // Get joint angles (degrees)
    const jointAnglesDeg = anglesDeg || [];
    if (!anglesDeg) {
        for (let i = 1; i <= 6; i++) {
            const angle = parseFloat(document.getElementById(`angle${i}`).value) || 0;
            jointAnglesDeg.push(angle);
        }
    }

    // Display loading indicator
    const resultElements = ['x-result', 'y-result', 'z-result', 'thetaX-result', 'thetaY-result', 'thetaZ-result'];
    resultElements.forEach(id => {
        const element = document.getElementById(id);
        element.textContent = '...';
        element.style.color = ''; // Reset color
        element.style.backgroundColor = ''; // Reset background
    });
    
    // Also clear error rate display
    const fkErrorRate = document.getElementById('fk-error-rate');
    fkErrorRate.textContent = '...';
    fkErrorRate.style.color = '';
    
    // Reset result container color
    const errorRateContainer = fkErrorRate.parentElement;
    errorRateContainer.style.backgroundColor = '';
    errorRateContainer.style.borderLeftColor = '';

    // Reset all result boxes
    const resultBoxes = document.querySelectorAll('#forward-tab .result-box');
    resultBoxes.forEach(box => {
        box.style.backgroundColor = '';
        box.style.color = '';
    });

    try {
        // Calculate forward kinematics using the core function
        const result = await coreCalculateFK(jointAnglesDeg);

        // Update UI Results
        if (result && result.pose) {
            const positionUI = createPosition(result.pose); // Convert m -> mm for display
            document.getElementById('x-result').textContent = positionUI.x.toFixed(2);
            document.getElementById('y-result').textContent = positionUI.y.toFixed(2);
            document.getElementById('z-result').textContent = positionUI.z.toFixed(2);
            document.getElementById('thetaX-result').textContent = positionUI.thetaX.toFixed(2);
            document.getElementById('thetaY-result').textContent = positionUI.thetaY.toFixed(2);
            document.getElementById('thetaZ-result').textContent = positionUI.thetaZ.toFixed(2);
            
            // Display error rate with conditional coloring
            if (result.error !== undefined) {
                const errorValue = result.error;
                // Format as a number with 2 decimal places
                const formattedError = errorValue.toFixed(2);
                fkErrorRate.textContent = formattedError;
                
                // Apply colors based on error value
                setErrorBasedColor(fkErrorRate, errorValue);
                // Apply colors to the container
                const errorContainer = fkErrorRate.closest('.error-rate-container');
                setErrorBasedBgColor(errorContainer, errorValue);
                
                // Color all result boxes in the result grid
                resultBoxes.forEach(box => {
                    setErrorBasedResultBoxColor(box, errorValue);
                    if (errorValue >= 0.001) {
                        setErrorBasedColor(box, errorValue);
                    }
                });
            } else {
                fkErrorRate.textContent = 'N/A';
            }

            // --- UPDATE VISUALIZATION ---
            const robotVisualization = getRobotVisualization();
            if (robotVisualization) {
                try {
                    // Convert angles to RADIANS for the visualization
                    const jointAnglesRad = jointAnglesDeg.map(degreesToRadians);
                    robotVisualization.updateRobotPose(jointAnglesRad);
                } catch (vizError) {
                    console.error("Error updating robot visualization:", vizError);
                }
            }
        } else {
            // Handle kinematics error
            const errorMsg = getTranslation('errorMessage');
            resultElements.forEach(id => {
                const element = document.getElementById(id);
                element.textContent = errorMsg;
                element.style.color = '';
                element.style.backgroundColor = '';
            });
            fkErrorRate.textContent = getTranslation('notAvailable');
            
        }
        updateCalculateButtonStyle(true);
        return result;
    } catch (error) {
        console.error("Error calculating forward kinematics:", error);
        const errorMsg = getTranslation('errorMessage');
        resultElements.forEach(id => {
            const element = document.getElementById(id);
            element.textContent = errorMsg;
            element.style.color = '';
            element.style.backgroundColor = '';
        });
        fkErrorRate.textContent = getTranslation('notAvailable');
        
        // Reset all result boxes on error
        resultBoxes.forEach(box => {
            box.style.backgroundColor = '';
            box.style.color = '';
        });
        
        throw error;
    }
}

// Define UI-updating wrapper for IK calculation
async function calculateInverseKinematics() {
    // Display loading indicator
    const ikErrorRate = document.getElementById('ik-position-error');
    ikErrorRate.textContent = getTranslation('loadingPlaceholder');
    ikErrorRate.style.color = '#f57f17'; // Dark amber for loading
    
    // Hide error element
    const errorElement = document.getElementById('ik-error');
    errorElement.style.display = 'none';
    
    // Reset error rate container color
    const errorRateContainer = ikErrorRate.parentElement;
    errorRateContainer.style.backgroundColor = '#fff8e1'; // Light yellow for loading
    errorRateContainer.style.borderLeftColor = '#ffc107'; // Amber for loading

    // Clear previous results
    for (let i = 1; i <= 6; i++) {
        const angleResult = document.getElementById(`ik-angle${i}-result`);
        angleResult.textContent = '...';
        angleResult.style.color = ''; // Reset color
        angleResult.style.backgroundColor = ''; // Reset background
    }

    // Reset all result boxes
    const resultBoxes = document.querySelectorAll('#inverse-tab .result-box');
    resultBoxes.forEach(box => {
        box.style.backgroundColor = '';
        box.style.color = '';
    });

    try {
        // Call the core IK calculation
        const result = await coreCalculateIK();

        if (result && result.success) {
            // Success: Update UI results
            for (let i = 1; i <= 6; i++) {
                document.getElementById(`ik-angle${i}-result`).textContent = result.q[i-1].toFixed(2);
            }
            
            // Display error rate and message with conditional coloring
            if (result.error !== undefined) {
                const errorValue = result.error;
                // Format as a number with 2 decimal places
                const formattedError = errorValue.toFixed(2);
                ikErrorRate.textContent = formattedError;
                
                // Apply colors based on error value
                setErrorBasedColor(ikErrorRate, errorValue);
                setErrorBasedBgColor(errorRateContainer, errorValue);
                
                // Color all result boxes
                resultBoxes.forEach(box => {
                    setErrorBasedResultBoxColor(box, errorValue);
                    if (errorValue >= 0.001) {
                        setErrorBasedColor(box, errorValue);
                    }
                });
            } else {
                // Default success message for no error
                ikErrorRate.textContent = '0.00';
                setErrorBasedColor(ikErrorRate, 0);
                setErrorBasedBgColor(errorRateContainer, 0);
                
                // Reset all result boxes to default color
                resultBoxes.forEach(box => {
                    box.style.backgroundColor = '';
                    box.style.color = '';
                });
            }

            // --- UPDATE VISUALIZATION ---
            const robotVisualization = getRobotVisualization();
            if (robotVisualization) {
                try {
                    // Convert resulting angles (degrees) to RADIANS
                    const jointAnglesRad = result.q.map(degreesToRadians);
                    robotVisualization.updateRobotPose(jointAnglesRad);
                } catch (vizError) {
                    console.error("Error updating robot visualization from IK:", vizError);
                }
            }
            // --------------------------
            
            // Update the button style
        } else {
            // Failure
            ikErrorRate.textContent = getTranslation('ikFailureMessage');
            ikErrorRate.style.color = '#d32f2f'; // Dark red
            errorRateContainer.style.backgroundColor = '#ffebee'; // Light red
            errorRateContainer.style.borderLeftColor = '#f44336'; // Red

            // Clear results
            for (let i = 1; i <= 6; i++) {
                document.getElementById(`ik-angle${i}-result`).textContent = getTranslation('emptyPlaceholder');
            }
        }
        updateCalculateButtonStyle(true);
        return result;
    } catch (error) {
        console.error('Error calling IK server:', error);
        
        // Show error message
        ikErrorRate.textContent = getTranslation('serverConnectionError');
        ikErrorRate.style.color = '#d32f2f'; // Dark red
        errorRateContainer.style.backgroundColor = '#ffebee'; // Light red
        errorRateContainer.style.borderLeftColor = '#f44336'; // Red
        
        // Clear results and reset colors
        for (let i = 1; i <= 6; i++) {
            const angleResult = document.getElementById(`ik-angle${i}-result`);
            angleResult.textContent = '-';
            angleResult.style.color = '';
            angleResult.style.backgroundColor = '';
        }
        
        // Reset all result boxes on error
        resultBoxes.forEach(box => {
            box.style.backgroundColor = '';
            box.style.color = '';
        });
        throw error;
    }
}

// Create a global app object to expose public API
window.app = {
    initializeApp,
    loadPreset,
    loadPosePreset,
    calculateForwardKinematics,
    calculateInverseKinematics,
    angular2cartesian,
    cartesian2angular,
    isAutoCalculateEnabled: false
};

// Export for modules that need to import
export {
    initializeApp,
    loadPreset,
    loadPosePreset,
    calculateForwardKinematics,
    calculateInverseKinematics,
    angular2cartesian,
    cartesian2angular
}; 