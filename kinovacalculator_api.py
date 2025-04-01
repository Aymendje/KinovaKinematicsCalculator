import kinovacalculator

# ========================================
#          Public API Functions
# ========================================

def _cartesian2angular_api(x, y, z, thetaX, thetaY, thetaZ):
    """
    Calculates joint angles (degrees) for a target Cartesian pose.

    Args:
        x, y, z (float): Target position in meters.
        thetaX, thetaY, thetaZ (float): Target orientation as ZYX Euler angles in degrees.

    Returns:
        tuple: (joint_angles, error_metrics)
               joint_angles: List of 6 joint angles in degrees, or None if IK fails.
               error_metrics: Dictionary with position_error_mm and orientation_error_deg values
    """
    global KINOVA_CHAIN

    target_pose = {
        "x": x, "y": y, "z": z,
        "thetaX": thetaX, "thetaY": thetaY, "thetaZ": thetaZ
    }
    joint_angles, error_metrics = kinovacalculator.cartesian2angular(target_pose)
    return joint_angles, error_metrics

def _angular2cartesian_api(angle1, angle2, angle3, angle4, angle5, angle6):
    """
    Calculates the Cartesian pose from joint angles (Forward Kinematics).

    Args:
        angle1-angle6 (float): Joint angles in degrees for the 6 active joints.

    Returns:
        dict or None: Dictionary with Cartesian pose {'x', 'y', 'z', 'thetaX', 'thetaY', 'thetaZ'}
                      (angles in degrees, ZYX convention), or None if FK fails.
    """
    joint_angles_deg = [angle1, angle2, angle3, angle4, angle5, angle6]
    cartesian_pose, error_metric = kinovacalculator.angular2cartesian(joint_angles_deg)
    return cartesian_pose, error_metric

def cartesian2angular_api(jsonData):
    try:
        x = float(jsonData.get('x', 0))
        y = float(jsonData.get('y', 0))
        z = float(jsonData.get('z', 0))
        thetaX = float(jsonData.get('thetaX', 0))
        thetaY = float(jsonData.get('thetaY', 0))
        thetaZ = float(jsonData.get('thetaZ', 0))
        
        joint_angles, error_metric = _cartesian2angular_api(x, y, z, thetaX, thetaY, thetaZ)
        return (joint_angles, error_metric)
    except Exception as e:
        return None
    
def angular2cartesian_api(jsonData):
    try:
        angle1 = float(jsonData.get('angle1', 0))
        angle2 = float(jsonData.get('angle2', 0))
        angle3 = float(jsonData.get('angle3', 0))
        angle4 = float(jsonData.get('angle4', 0))
        angle5 = float(jsonData.get('angle5', 0))
        angle6 = float(jsonData.get('angle6', 0))
        
        cartesian_pose, error_metric = _angular2cartesian_api(angle1, angle2, angle3, angle4, angle5, angle6)
        return (cartesian_pose, error_metric)
    except Exception as e:
        return None