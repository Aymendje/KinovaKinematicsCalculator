/**
 * Forward Kinematics module for calculating robot poses
 */

// Import necessary utilities
import { 
    roundTo,
    degreesToRadians,
    createPosition,
    getRandomInRange,
    setErrorBasedColor,
    setErrorBasedBgColor,
    setErrorBasedResultBoxColor
} from './helper.js';

// Constants for Presets
export const angles_zero = [0, 0, 0, 0, 0, 0];
export const angles_home = [0, 344.0, 75.0, 0, 300.0, 0]; // Adjusted home position from kinematics.js
export const angles_random = () => [
    getRandomInRange(-154.1, 154.1),
    getRandomInRange(-150.1, 150.1),
    getRandomInRange(-150.1, 150.1),
    getRandomInRange(-148.98, 148.98),
    getRandomInRange(-144.97, 145.0),
    getRandomInRange(-148.98, 148.98)
];

// Default cartesian values for presets
export const cartesian_zero = { x:  0.05700, y: -0.01000, z:  1.00325, thetaX: 0, thetaY: 0, thetaZ: 90 };
export const cartesian_home = { x:  0.43863, y:  0.19351, z:  0.44908, thetaX: -90.58, thetaY: 30.00, thetaZ: -178.85 };

/**
 * Converts joint angles (degrees) to cartesian pose
 * @param {Array} jointAnglesDeg - Array of 6 joint angles in degrees
 * @returns {Promise} - Promise resolving to pose and error data
 */
export async function angular2cartesian(jointAnglesDeg) {
    try {
        // Destructure the joint angles array
        const [angle1, angle2, angle3, angle4, angle5, angle6] = jointAnglesDeg;
        
        // Call the Python function through API endpoint
        const endpoint = '/api/angular2cartesian';
        
        // Make the request but return a promise that resolves to the result
        return new Promise((resolve, reject) => {
            fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    angle1, angle2, angle3, angle4, angle5, angle6
                }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                resolve(data); // Return the API response object with pose and error
            })
            .catch(error => {
                console.error(`Error in angular2cartesian API call: ${error.message}`);
                reject(error);
            });
        });
    } catch (e) {
        console.error(`Error in angular2cartesian: ${e.message}`);
        console.error(e.stack);
        return null;
    }
}

/**
 * Generate a random cartesian pose
 * @returns {Promise<Object>} - Promise resolving to a random cartesian pose
 */
export const cartesian_random = async () => {
    try {
        const result = await angular2cartesian(angles_random());
        return result.pose;
    } catch (error) {
        console.error("Error generating random cartesian pose:", error);
        return null;
    }
};

/**
 * Calculates forward kinematics for given angles or reads from UI
 * @param {Array|null} anglesDeg - Optional array of joint angles in degrees
 * @returns {Promise} - Promise resolving when calculation is complete
 */
export async function calculateForwardKinematics(anglesDeg = null) {
    // This function definition will be updated to include UI manipulation in main.js
    // Here we only implement the core calculation logic

    // Get joint angles (degrees)
    const jointAnglesDeg = anglesDeg || [];
    if (!anglesDeg) {
        for (let i = 1; i <= 6; i++) {
            const angle = parseFloat(document.getElementById(`angle${i}`).value) || 0;
            jointAnglesDeg.push(angle);
        }
    }

    try {
        // Calculate forward kinematics
        const result = await angular2cartesian(jointAnglesDeg);
        return result;
    } catch (error) {
        console.error("Error calculating forward kinematics:", error);
        throw error;
    }
}

/**
 * Load a preset joint angle configuration
 * @param {string} type - Preset type ('zero', 'home', or 'random')
 * @returns {Array} - Array of joint angles in degrees
 */
export function getPresetAngles(type) {
    switch(type) {
        case 'zero':
            return angles_zero;
        case 'home':
            return angles_home;
        case 'random':
            return angles_random();
        default:
            return [0, 0, 0, 0, 0, 0];
    }
}

/**
 * Get a preset cartesian pose
 * @param {string} type - Preset type ('zero', 'home', or 'random')
 * @returns {Promise<Object>} - Promise resolving to a cartesian pose
 */
export async function getPresetPose(type) {
    switch(type) {
        case 'home':
            return cartesian_home;
        case 'zero':
            return cartesian_zero;
        case 'random':
            let targetPose = await cartesian_random();
            // Recalculate if the first random generation failed
            while (!targetPose) {
                console.warn("Recalculating random cartesian pose...");
                targetPose = await cartesian_random();
            }
            return targetPose;
        default:
            return cartesian_zero;
    }
} 