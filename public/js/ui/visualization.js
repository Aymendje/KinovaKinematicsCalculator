/**
 * Robot visualization module
 */

// Global visualization object
let robotVisualization = null;

/**
 * Set robot visualization object 
 * @param {Object} visualization - RobotVisualization instance
 */
export function setRobotVisualization(visualization) {
    robotVisualization = visualization;
}

/**
 * Get robot visualization object
 * @returns {Object} - RobotVisualization instance
 */
export function getRobotVisualization() {
    return robotVisualization;
} 