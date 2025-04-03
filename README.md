# Kinova Gen3 Lite Robot Kinematics Calculator

An interactive application for visualizing and calculating the forward and inverse kinematics of a Kinova Gen3 Lite robot arm. Available as both a desktop application (PyWebView) and a web application (Flask).

![Kinova Gen3 Lite Robot](https://img.icons8.com/fluency/96/robot.png)

## Features

*   **Interactive 3D Visualization:** Real-time 3D model of the Kinova Gen3 Lite arm powered by Three.js with intuitive camera controls.
*   **Forward Kinematics (FK):** Calculate the end-effector's Cartesian pose (position and orientation) from joint angles with error metrics.
*   **Inverse Kinematics (IK):** Calculate required joint angles to reach a target Cartesian pose with position/orientation error feedback.
*   **Preset Configurations:** Quickly load predefined joint configurations (Zero, Home) or generate random configurations.
*   **Real-time Calculation:** Option for automatic calculation as values change.
*   **Error Metrics:** View numerical error rates for both FK and IK calculations.
*   **Responsive Design:** Modern UI layout that adapts to different screen sizes.
*   **Dark/Light Theme:** Toggle between dark and light mode for comfortable viewing.
*   **Multi-language Support:** Interface text can be switched between languages (using translation files in the `lang/` directory).
*   **Unified Codebase:** Same code runs as both a desktop application and a web application.

## Getting Started

### Prerequisites

*   Python 3.8 or later
*   pip (Python package installer)

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/KinovaKinematicsCalculator.git
    cd KinovaKinematicsCalculator
    ```

2.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

### Running the Application

#### Desktop Application (PyWebView)

Run the application as a native desktop application:

```bash
python app_webview.py
```

This will open a native window with the application interface.

#### Web Application (Flask)

Alternatively, run as a web application:

```bash
python app.py
```

Then open your web browser and navigate to `http://localhost:5000`

## How It Works

The application uses a unified JavaScript codebase that automatically detects whether it's running in a PyWebView environment or a web browser:

- In PyWebView: Uses `window.pywebview.api` to directly call Python methods
- In web browser: Uses standard HTTP fetch requests to Flask endpoints

This is implemented with a simple detection mechanism:

```javascript
const callBackend = async (endpoint, data) => {
    // If in PyWebView, use direct API calls
    if (window.pywebview !== undefined) {
        const methodName = endpoint.replace('/api/', '');
        return await window.pywebview.api[methodName](data);
    } 
    // Otherwise, use HTTP fetch
    else {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        return await response.json();
    }
};
```

## Project Structure

```
.
├── public/                     # Frontend assets
│   ├── css/                    # CSS stylesheets
│   │   ├── styles.css          # Main CSS styles
│   │   ├── dark-mode.css       # Dark mode styles
│   │   ├── colors.css          # Color definitions
│   │   └── components.css      # Component-specific styles
│   ├── js/                     # JavaScript files
│   │   ├── main.js             # Core application logic
│   │   ├── robot-visualization.js # Three.js visualization
│   │   ├── forwardk.js         # Forward kinematics UI logic
│   │   ├── inversek.js         # Inverse kinematics UI logic
│   │   ├── api.js              # Unified API utility (PyWebView/HTTP)
│   │   ├── ui.js               # UI components
│   │   ├── helper.js           # Utility functions
│   │   ├── colors.js           # Color management
│   │   ├── translation.js      # Localization support
│   │   └── ui/                 # Additional UI components
│   ├── external/               # External libraries (Three.js, etc.)
│   ├── lang/                   # Translation JSON files
│   └── index.html              # Main HTML document
├── app.py                      # Flask backend server
├── app_webview.py              # PyWebView desktop application
├── kinovacalculator.py         # Core kinematics calculations
├── kinovacalculator_api.py     # API layer for kinematics calculations
├── kinovacalculator_test.py    # Test suite
├── gen3_lite.urdf              # URDF robot model description
├── requirements.txt            # Python dependencies
├── vercel.json                 # Vercel deployment configuration
└── README.md                   # This file
```

## Dependencies

*   **Backend:**
    *   Flask - Web server framework
    *   PyWebView - Desktop application framework
    *   ikpy (3.4.2) - Inverse kinematics library
    *   numpy (1.26.4) - Numerical computation
    *   scipy (1.15.2) - Scientific computing

*   **Frontend:**
    *   Three.js - 3D visualization library (loaded via importmap)

## Deployment

The web application is configured for deployment on Vercel using the provided `vercel.json` configuration.

## How to Use

1. **Forward Kinematics**:
   - Enter the joint angles (in degrees) for the 6 joints
   - Click "Calculate" or enable "Auto" for real-time updates
   - View the resulting end-effector position and orientation

2. **Inverse Kinematics**:
   - Switch to the "Inverse Kinematics" tab
   - Enter the desired end-effector position (X, Y, Z) in millimeters
   - Enter the desired orientation (ThetaX, ThetaY, ThetaZ) in degrees
   - Click "Calculate" or enable "Auto" for real-time updates
   - View the resulting joint angles

3. **Presets**:
   - Use the preset buttons to load common configurations
   - "Zero" - All joints at 0 degrees
   - "Home" - The robot's home position
   - "Random" - A random valid configuration

4. **Visualization**:
   - Use the mouse to interact with the 3D visualization:
     - Left mouse button: Rotate
     - Middle mouse button/scroll wheel: Zoom
     - Right mouse button: Pan

## Troubleshooting

- If you encounter "Failed to solve inverse kinematics" errors, try adjusting your target position to be within the robot's workspace.
- Joint angles are limited to the physical constraints of the Kinova Gen3 Lite robot.

## License

This project is licensed under the terms included in the LICENSE file. 