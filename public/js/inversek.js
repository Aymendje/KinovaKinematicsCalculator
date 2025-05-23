/**
 * Inverse Kinematics module for calculating joint angles from cartesian poses
 */

// Import unified API utility
import { callBackend } from './api.js';

/**
 * Convert cartesian pose to joint angles
 * @param {number} x_mm - X position in millimeters
 * @param {number} y_mm - Y position in millimeters
 * @param {number} z_mm - Z position in millimeters
 * @param {number} thetaX_deg - X rotation in degrees
 * @param {number} thetaY_deg - Y rotation in degrees
 * @param {number} thetaZ_deg - Z rotation in degrees
 * @returns {Promise} - Promise resolving to joint angles and error data
 */
export async function cartesian2angular(x_mm, y_mm, z_mm, thetaX_deg, thetaY_deg, thetaZ_deg) {
    try {
        // Call the API using the unified utility
        return await callBackend('/api/cartesian2angular', {
            x: x_mm / 1000.0,  // Convert mm to m
            y: y_mm / 1000.0,
            z: z_mm / 1000.0,
            thetaX: thetaX_deg,
            thetaY: thetaY_deg,
            thetaZ: thetaZ_deg
        });
    } catch (e) {
        console.error(`Error in cartesian2angular: ${e.message}`);
        console.error(e.stack);
        return Promise.reject(e);
    }
}

/**
 * Calculate inverse kinematics based on UI values
 * This function definition will be updated in main.js
 * @returns {Promise} - Promise resolving when calculation is complete
 */
export async function calculateInverseKinematics() {
    // Get target pose from UI (mm, degrees)
    const x_mm = parseFloat(document.getElementById('pos-x').value.replace(',', '.')) || 0;
    const y_mm = parseFloat(document.getElementById('pos-y').value.replace(',', '.')) || 0;
    const z_mm = parseFloat(document.getElementById('pos-z').value.replace(',', '.')) || 0;
    const thetaX_deg = parseFloat(document.getElementById('orient-x').value.replace(',', '.')) || 0;
    const thetaY_deg = parseFloat(document.getElementById('orient-y').value.replace(',', '.')) || 0;
    const thetaZ_deg = parseFloat(document.getElementById('orient-z').value.replace(',', '.')) || 0;

    try {
        // Call the API with the cartesian pose
        const result = await cartesian2angular(x_mm, y_mm, z_mm, thetaX_deg, thetaY_deg, thetaZ_deg);
        return result;
    } catch (error) {
        console.error('Error calling IK server:', error);
        throw error;
    }
} 