import os
import webview
import kinovacalculator_api

class KinovaAPI:
    def cartesian2angular(self, data):
        result = kinovacalculator_api.cartesian2angular_api(data)
        if result is None or result[0] is None:
            return {
                'success': False,
                'error': 'Failed to solve inverse kinematics'
            }
        
        joint_angles, error_metric = result
        
        return {
            'success': True,
            'q': joint_angles,
            'error': round(error_metric, 2)
        }

    def angular2cartesian(self, data):
        result = kinovacalculator_api.angular2cartesian_api(data)
        
        if result[0] is None:
            return {
                'success': False,
                'error': 'Failed to calculate forward kinematics'
            }
            
        cartesian_pose, error_metric = result
        
        return {
            'success': True,
            'pose': cartesian_pose,
            'error': round(error_metric, 2)
        }

def get_absolute_path(relative_path):
    """Get the absolute path for a file in this directory"""
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), relative_path)

def start_server():
    api = KinovaAPI()
    # Create a window with the HTML file
    window = webview.create_window(
        title='Kinova Kinematics Calculator',
        url=get_absolute_path('public/index.html'),  # Using the original HTML file
        js_api=api,
        width=1200,
        height=800,
        min_size=(800, 600)
    )
    
    webview.start(debug=True)

if __name__ == '__main__':
    # Initialize the robot model before starting the GUI
    start_server() 