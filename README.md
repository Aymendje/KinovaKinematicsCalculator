# Kinova Gen3 Lite Robot Kinematics Calculator

An interactive web application for visualizing and calculating the forward and inverse kinematics of a Kinova Gen3 Lite robot arm.

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

## Getting Started

### Prerequisites

*   Python 3.x
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

1.  **Start the Flask server:**
    ```bash
    python server.py
    ```

2.  **Open your web browser** and navigate to `http://127.0.0.1:5000`

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
│   │   ├── ui.js               # UI components
│   │   ├── helper.js           # Utility functions
│   │   ├── colors.js           # Color management
│   │   ├── translation.js      # Localization support
│   │   └── ui/                 # Additional UI components
│   ├── external/               # External libraries (Three.js, etc.)
│   ├── lang/                   # Translation JSON files
│   └── index.html              # Main HTML document
├── server.py                   # Flask backend server
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
    *   ikpy (3.4.2) - Inverse kinematics library
    *   numpy (1.26.4) - Numerical computation
    *   scipy (1.15.2) - Scientific computing

*   **Frontend:**
    *   Three.js - 3D visualization library (loaded via importmap)

## Deployment

The application is configured for deployment on Vercel using the provided `vercel.json` configuration.

## How it Works

1. The frontend interface provides inputs for joint angles (FK) or Cartesian poses (IK).
2. When calculations are requested (manually or automatically):
   - For Forward Kinematics: Joint angles are sent to the `/api/angular2cartesian` endpoint
   - For Inverse Kinematics: Target poses are sent to the `/api/cartesian2angular` endpoint
3. The backend processes the request using the kinematics engine in `kinovacalculator.py`
4. Results, including error metrics, are returned to the frontend
5. The 3D visualization is updated using Three.js to show the robot's current configuration
6. Error metrics provide feedback on calculation accuracy

## License

This project is licensed under the terms included in the LICENSE file. 