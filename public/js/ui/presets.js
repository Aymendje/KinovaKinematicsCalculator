/**
 * Presets module for managing configuration presets
 */

import { getPresetAngles, getPresetPose } from '../forwardk.js';
import { handleCalculationError } from './error.js';

/**
 * Load a preset joint angle configuration
 * @param {string} type - Preset type ('zero', 'home', or 'random')
 */
export function loadPreset(type) {
    try {
        const anglesDeg = getPresetAngles(type);
        if (!anglesDeg || !Array.isArray(anglesDeg) || anglesDeg.length < 6) {
            throw new Error("Invalid angles returned from getPresetAngles");
        }

        // Set UI input values
        for (let i = 1; i <= 6; i++) {
            document.getElementById(`angle${i}`).value = anglesDeg[i-1].toFixed(2);
        }

        // Calculate FK with the precise (unrounded) values
        if (window.app && window.app.calculateForwardKinematics) {
            window.app.calculateForwardKinematics(anglesDeg).catch(err => 
                handleCalculationError("calculating FK", type, err)
            );
        } else {
            console.error("window.app.calculateForwardKinematics is not available");
        }
    } catch (error) {
        handleCalculationError("loading angle preset", type, error);
    }
}

/**
 * Load a preset cartesian pose
 * @param {string} type - Preset type ('zero', 'home', or 'random')
 */
export async function loadPosePreset(type) {
    try {
        const pose = await getPresetPose(type);
        
        if (!pose || !('x' in pose) || !('y' in pose) || !('z' in pose) ||
            !('thetaX' in pose) || !('thetaY' in pose) || !('thetaZ' in pose)) {
            throw new Error("Invalid pose returned from getPresetPose");
        }
        
        document.getElementById('pos-x').value = (pose.x * 1000).toFixed(2);
        document.getElementById('pos-y').value = (pose.y * 1000).toFixed(2);
        document.getElementById('pos-z').value = (pose.z * 1000).toFixed(2);
        document.getElementById('orient-x').value = pose.thetaX.toFixed(2);
        document.getElementById('orient-y').value = pose.thetaY.toFixed(2);
        document.getElementById('orient-z').value = pose.thetaZ.toFixed(2);

        // Calculate IK with the new values
        if (window.app && window.app.calculateInverseKinematics) {
            window.app.calculateInverseKinematics().catch(err => 
                handleCalculationError("calculating IK", type, err)
            );
        } else {
            console.error("window.app.calculateInverseKinematics is not available");
        }
    } catch (error) {
        handleCalculationError("loading pose preset", type, error);
    }
} 