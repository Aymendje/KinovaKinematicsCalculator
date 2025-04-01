#!/usr/bin/env python3

import math
import numpy as np
from scipy.spatial.transform import Rotation as R
from ikpy.chain import Chain
import warnings
import os

warnings.filterwarnings("ignore", module="ikpy.*")
KINOVA_CHAIN = None

# ----- Test Helper Functions -----
def _min_angle_diff(a1, a2):
    """Calculate the minimum angular difference accounting for wraparound."""
    a1_norm = a1 % 360
    a2_norm = a2 % 360
    diff = abs(a1_norm - a2_norm) % 360
    return min(diff, 360 - diff)

def _compareAngular(trip, round):
    angular_diff = np.array([_min_angle_diff(t, a) for t, a in zip(trip, round)])
    wrapped_rmse = np.sqrt(np.mean(angular_diff**2))
    return wrapped_rmse

def _compareCartesian(trip, round):
    pos_diff = {
        'x': abs(trip['x'] - round['x']),
        'y': abs(trip['y'] - round['y']),
        'z': abs(trip['z'] - round['z']),
        'thetaX': _min_angle_diff(trip['thetaX'], round['thetaX']),
        'thetaY': _min_angle_diff(trip['thetaY'], round['thetaY']),
        'thetaZ': _min_angle_diff(trip['thetaZ'], round['thetaZ'])
    }

    # Calculate RMSE for position and orientation separately
    euclidean_distance = math.sqrt(pos_diff['x']**2 + pos_diff['y']**2 + pos_diff['z']**2)
    angle_rmse = math.sqrt((pos_diff['thetaX']**2 + pos_diff['thetaY']**2 + pos_diff['thetaZ']**2) / 3)

    combined_error = math.sqrt(euclidean_distance**2 + (0.1 * angle_rmse)**2)
    return combined_error


# ----- Kinematic Chain Creation (ikpy URDF - Simplified) -----
def _create_gen3_lite_chain_from_urdf_final(urdf_filepath):
    """Creates the ikpy Chain directly from a URDF file using explicit active_links_mask."""
    # Hardcoded active links mask for Kinova Gen3 Lite
    # [0=Base, 1=J1, 2=J2, 3=J3, 4=J4, 5=J5, 6=J6, 7=EE_Joint, 8=Tool_Joint]
    
    # Create chain from URDF
    gen3_chain = Chain.from_urdf_file(
        urdf_filepath,
        active_links_mask=[False, True, True, True, True, True, True, False, False]
    )
    
    return gen3_chain

# ----- Inverse Kinematics Function -----
def _cartesian2angular(target_pose: dict):
    """ Calculates joint angles (degrees) for a target Cartesian pose using the ikpy chain.
    
    Returns:
        tuple: (joint_angles_deg, error_metrics)
               joint_angles_deg: List of joint angles in degrees, or None if IK fails
               error_metrics: Dictionary with position_error_mm and orientation_error_deg values
    """
    global KINOVA_CHAIN
    # Setup target position and orientation
    target_position = [target_pose["x"], target_pose["y"], target_pose["z"]]
    target_orientation_matrix = R.from_euler('zyx', [target_pose["thetaZ"], target_pose["thetaY"], target_pose["thetaX"]], degrees=True).as_matrix()
    
    # Initialize with zeros - Kinova Gen3 Lite has 9 links in standard URDF setup
    initial_position_guess = [0.0] * len(KINOVA_CHAIN.links)
    
    # Perform inverse kinematics
    ik_solution_rad_full = KINOVA_CHAIN.inverse_kinematics(
        target_position=target_position,
        target_orientation=target_orientation_matrix,
        orientation_mode="all",
        initial_position=initial_position_guess
    )
    
    # Hardcoded active joint indices for Kinova Gen3 Lite
    # Indices 1-6 correspond to the 6 active joints in the 9-link URDF chain    
    # Extract only the angles for active joints
    joint_angles_rad = [ik_solution_rad_full[idx] for idx in range(1, 7)]
    
    # Convert to degrees
    joint_angles_deg = [math.degrees(angle) for angle in joint_angles_rad]
    
    return joint_angles_deg


def cartesian2angular(target_pose: dict):
    trip = _cartesian2angular(target_pose)
    back = _angular2cartesian(trip)
    round = _cartesian2angular(back)
    return trip, _compareAngular(trip, round)

# ----- Forward Kinematics Function -----
def _angular2cartesian(joint_angles_deg: list):
    """ Calculates the Cartesian pose (dict) from joint angles (degrees) using the ikpy chain."""
    global KINOVA_CHAIN

    # Convert input degrees to radians
    joint_angles_rad = [math.radians(a) for a in joint_angles_deg]
    
    # Create the full input vector for forward_kinematics
    # Hardcoded for Kinova Gen3 Lite: 9-link chain with 6 active joints at indices 1-6
    fk_input_angles_rad = [0.0] * len(KINOVA_CHAIN.links)
    active_joint_indices = [1, 2, 3, 4, 5, 6]
    
    # Place active joint angles at their correct indices
    for i, idx in enumerate(active_joint_indices):
        fk_input_angles_rad[idx] = joint_angles_rad[i]
    
    # Perform forward kinematics
    fk_matrix = KINOVA_CHAIN.forward_kinematics(fk_input_angles_rad)
    
    # Extract position and rotation from the 4x4 transformation matrix
    position = fk_matrix[:3, 3]
    rotation_matrix = fk_matrix[:3, :3]
    
    # Convert rotation matrix to Euler angles (ZYX convention, degrees)
    euler_angles_deg = R.from_matrix(rotation_matrix).as_euler('zyx', degrees=True)

        
    # Return as dictionary with same format as IK target
    cartesian_pose = {
        "x": position[0],
        "y": position[1],
        "z": position[2],
        "thetaX": euler_angles_deg[2],  # ZYX order: index 2 is X rotation
        "thetaY": euler_angles_deg[1],  # index 1 is Y rotation
        "thetaZ": euler_angles_deg[0]   # index 0 is Z rotation
    }
    return cartesian_pose



def angular2cartesian(joint_angles_deg: list):
    trip = _angular2cartesian(joint_angles_deg)
    back = _cartesian2angular(trip)
    round = _angular2cartesian(back)
    return trip, _compareCartesian(trip, round)

# ----- init -----
def _init():
    global KINOVA_CHAIN
    script_dir = os.path.dirname(__file__) if "__file__" in locals() else os.getcwd()
    # Use absolute path for robustness
    script_dir = os.path.abspath(script_dir)
    urdf_file = os.path.join(script_dir, "gen3_lite.urdf")
    KINOVA_CHAIN = _create_gen3_lite_chain_from_urdf_final(urdf_file)

_init()
