import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


export class RobotVisualization {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container element with ID '${containerId}' not found.`);
        }

        // --- Essential THREE.js components ---
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // --- Robot specific properties ---
        this.dhParams = this.defineDHParameters(); // Store DH parameters
        this.robotBase = new THREE.Object3D(); // Base of the robot hierarchy
        this.frames = []; // Array to hold Object3D for each frame (O1 to O6)
        this.linkMeshes = []; // Array to hold the visual meshes for links

        // --- Initialization ---
        this.initScene();
        this.initCamera();
        this.initRenderer();
        this.initLights();
        this.initControls();
        this.setupRobotModel(); // Create frame hierarchy and geometry
        this.addBasePlatform(); // Add a visual base

        this.scene.add(this.robotBase);

        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this), false);

        // Start animation loop
        this.animate();

        console.log("RobotVisualization setup complete.");
    }

    // --- DH Parameters Definition ---
    defineDHParameters() {
        // Convert dimensions from mm to meters
        const m = (val_mm) => val_mm / 1000.0;

        // Classic DH Parameters based on the provided table
        // [alpha, a, d, theta_offset]
        return [
            // i=1: alpha(i), a(i), d(i), theta(i) offset
            { alpha: Math.PI / 2, a: m(0.0),   d: m(128.3 + 115.0), theta_offset: 0},         // Link 1 (Joint 1 -> Frame 1)
            { alpha: Math.PI,     a: m(280.0), d: m(30.0),          theta_offset: Math.PI / 2 }, // Link 2 (Joint 2 -> Frame 2)
            { alpha: Math.PI / 2, a: m(0.0),   d: m(20.0),          theta_offset: Math.PI / 2 }, // Link 3 (Joint 3 -> Frame 3)
            { alpha: Math.PI / 2, a: m(0.0),   d: m(140.0 + 105.0), theta_offset: Math.PI / 2 }, // Link 4 (Joint 4 -> Frame 4)
            { alpha: Math.PI / 2, a: m(0.0),   d: m(28.5 + 28.5),   theta_offset: Math.PI },     // Link 5 (Joint 5 -> Frame 5)
            { alpha: 0,           a: m(0.0),   d: m(105.0 + 130.0), theta_offset: 0 }, // Link 6 (Joint 6 -> Frame 6 / O_Tool) - Note: Table uses pi/2 offset, diagrams often use pi. Recheck this offset if needed.
        ];
        // Note: The table has q6 + pi/2. I used pi/2 here. If the diagram's zero pos needs pi, adjust here.
    }

    // --- Initialization Methods ---
    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0); // Light gray background
    
        // Add a grid helper on the XY plane (Z up)
        const gridHelper = new THREE.GridHelper(2, 10); // Size 2 meters, 10 divisions
        gridHelper.rotation.x = Math.PI / 2; // Rotate grid to lie on XY plane
        this.scene.add(gridHelper);
    
         // Add world axes helper (Red=X, Green=Y, Blue=Z(Up))
        // const axesHelperWorld = new THREE.AxesHelper(0.5); // Length 0.5 meters - REMOVED
        // this.scene.add(axesHelperWorld); // REMOVED

        // --- Create thicker axes using cylinders ---
        const axisRadius = 0.005; // Adjust thickness
        const axisLength = 0.5;   // Keep the same length

        // Materials
        const xAxisMat = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red
        const yAxisMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Green
        const zAxisMat = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Blue

        // Geometry (shared instance, scaled/rotated per axis)
        const axisGeo = new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, 8);

        // X Axis (Red)
        const xAxis = new THREE.Mesh(axisGeo, xAxisMat);
        xAxis.rotation.z = -Math.PI / 2; // Rotate cylinder to align with X
        xAxis.position.x = axisLength / 2; // Position center along X
        this.scene.add(xAxis);

        // Y Axis (Green)
        const yAxis = new THREE.Mesh(axisGeo, yAxisMat);
        // No rotation needed, cylinder defaults to Y-up
        yAxis.position.y = axisLength / 2; // Position center along Y
        this.scene.add(yAxis);

        // Z Axis (Blue)
        const zAxis = new THREE.Mesh(axisGeo, zAxisMat);
        zAxis.rotation.x = Math.PI / 2; // Rotate cylinder to align with Z
        zAxis.position.z = axisLength / 2; // Position center along Z
        this.scene.add(zAxis);
        // -----------------------------------------
    }
    
    initRenderer() {
        // ... (no changes needed)
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
    }
    
    initLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft white light
        this.scene.add(ambientLight);
    
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        // Adjust light position for Z-up
        directionalLight.position.set(5, 7.5, 10); // Z is now the 'height' component
        this.scene.add(directionalLight);
    }

    initCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
        
        // **Set camera UP vector to Z-axis BEFORE positioning/rotating**
        this.camera.up.set(0, 0, 1);

        const boxPosition = { x: 0, y: 0, z: 1 };
        
        // Position camera below and in front of the blue box
        this.camera.position.set(
            boxPosition.x, 
            boxPosition.y - 1.5, 
            boxPosition.z + 0.5
        );
        
        // Look up at the blue box
        this.camera.lookAt(boxPosition.x, boxPosition.y, boxPosition.z );
        
        // Apply rotation around Z-axis using rotation matrix
        const rotationAngle = Math.PI / 4 / 2;
        
        // Create rotation matrix
        const rotationMatrix = new THREE.Matrix4().makeRotationZ(rotationAngle);
        
        // Apply rotation to camera position
        this.camera.position.applyMatrix4(rotationMatrix);
        
        // Re-orient camera to look at target after rotation
        this.camera.lookAt(boxPosition.x, boxPosition.y, boxPosition.z);
    }
    
    initControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 0.5;
        this.controls.maxDistance = 10;
        
        const boxPosition = { x: 0, y: 0, z: 0.5 };
        this.controls.target.set(boxPosition.x, boxPosition.y, boxPosition.z);
        this.controls.update();
    }

    // --- Robot Structure Setup ---
    setupRobotModel() {
        // Frame markers (optional, but can be useful)
        // const frameGeometry = new THREE.SphereGeometry(0.01);
        // const frameMaterial = new THREE.MeshBasicoloraterial({ color: 0xff0000 });

        let currentParent = this.robotBase; // Start attaching frames to the base

        for (let i = 0; i < this.dhParams.length; i++) {
            // Create Frame Object3D (e.g., frames[0] represents O1 relative to O0/Base)
            const frame = new THREE.Object3D();
            frame.name = `Frame_${i + 1}`; // Frame names O1, O2, ... O6
            this.frames.push(frame);

            // Add AxesHelper to visualize frame orientation
            const axesHelper = new THREE.AxesHelper(0.15); // Smaller axes for frames
            frame.add(axesHelper);

            // Add frame origin marker (optional)
            // const frameViz = new THREE.Mesh(frameGeometry, frameMaterial);
            // frame.add(frameViz);

            // Add the current frame to the previous one (kinematic chain)
            currentParent.add(frame);

            // The current frame becomes the parent for the next frame
            currentParent = frame;

            // Disable matrix auto-update since we'll set it manually from DH params
            frame.matrixAutoUpdate = false;
        }

        // --- ADD END EFFECTOR PLACEHOLDER TO LAST FRAME ---
        // Note: 'currentParent' here is the last frame (Frame 6 / this.frames[5])
         const eeGeo = new THREE.BoxGeometry(0.05, 0.05, 0.05);
         const eeMat = new THREE.MeshStandardMaterial({ color: 0x5555ff });
         const eeMesh = new THREE.Mesh(eeGeo, eeMat);
         eeMesh.name = "EndEffectorVisual";
         eeMesh.position.z = 0.025; // Position along Frame 6's Z-axis
         currentParent.add(eeMesh); // Add to Frame 6
         // We might need to manage this mesh separately if updating geometry dynamically

        // Create a group to hold all link geometry meshes later
        this.linkGeometryGroup = new THREE.Group();
        this.linkGeometryGroup.name = "LinkGeometry";
        this.scene.add(this.linkGeometryGroup); // Add group directly to the scene
    }

// Inside RobotVisualization class...
addBasePlatform() {
    // Define base parameters
    const armRadius = 0.05; // Same radius as arm segments (defined in updateLinkGeometry)
    const baseHeight = 0.06; // 6cm

    // Create cylinder geometry (non-tapered)
    const platformGeo = new THREE.CylinderGeometry(
        armRadius,  // radiusTop
        armRadius,  // radiusBottom
        baseHeight, // height
        32          // radialSegments - for smoothness
    );

    // Rotate the GEOMETRY itself so the cylinder's height is aligned with the Z-axis
    platformGeo.rotateX(Math.PI / 2);

    // Define material (can adjust color/properties)
    const platformMat = new THREE.MeshStandardMaterial({
        color: 0x004444, // A slightly lighter grey than before
        metalness: 0.9,
        roughness: 0.9
    });

    // Create the mesh
    const platformMesh = new THREE.Mesh(platformGeo, platformMat);

    // Position the center of the base cylinder.
    // To make the top surface sit roughly at Z=0 (where the grid is),
    // the center needs to be at Z = -height / 2.
    platformMesh.position.set(0, 0, -baseHeight / 2);

    // Enable shadows for better visual integration
    platformMesh.castShadow = true;
    platformMesh.receiveShadow = true;

    // Add the mesh directly to the main scene
    this.scene.add(platformMesh);
}


    updateLinkGeometry() {
        // Clear previous link geometry
        this.linkGeometryGroup.clear(); // Remove all children (meshes) from the group

        const linkMaterial = new THREE.MeshStandardMaterial({
            color: 0xeeeeee, // Use a single color for simplicity now
            metalness: 0.3,
            roughness: 0.6
        });
        const radius = 0.03;
        const worldPos = new THREE.Vector3(); // Reusable vector for world positions

        // Get World Position of Robot Base (Frame 0)
        const prevFrameWorldPos = this.robotBase.getWorldPosition(worldPos.clone());

        // Iterate through the frames (O1 to O6)
        for (let i = 0; i < this.frames.length; i++) {
            const currentFrame = this.frames[i]; // This is Frame i+1 (e.g., O1, O2, ...)

            // Get World Position of the current frame's origin
            const currentFrameWorldPos = currentFrame.getWorldPosition(worldPos.clone());

            // Calculate vector from previous frame origin to current one
            const linkVector = new THREE.Vector3().subVectors(currentFrameWorldPos, prevFrameWorldPos);
            const linkLength = linkVector.length();

            if (linkLength > 1e-4) { // Only draw if length is significant
                const geometry = new THREE.CylinderGeometry(radius, radius, linkLength, 16);

                // Quaternion to align cylinder (Y-up) with linkVector
                const quaternion = new THREE.Quaternion();
                const cylinderUp = new THREE.Vector3(0, 1, 0);
                const targetDirection = linkVector.clone().normalize();
                // Handle potential zero vector or opposite vectors
                 if (targetDirection.lengthSq() > 1e-6 && Math.abs(cylinderUp.dot(targetDirection)) < 0.9999 ) {
                    quaternion.setFromUnitVectors(cylinderUp, targetDirection);
                    geometry.applyQuaternion(quaternion);
                 } else if (cylinderUp.dot(targetDirection) <= -0.9999) {
                     // Vectors are opposite, rotate 180 degrees around an arbitrary axis (e.g., X)
                     geometry.rotateX(Math.PI);
                 }
                 // If vectors are parallel, no rotation needed.

                const mesh = new THREE.Mesh(geometry, linkMaterial);

                // Position the center of the cylinder halfway between the two world points
                mesh.position.copy(prevFrameWorldPos).add(linkVector.multiplyScalar(0.5));

                mesh.castShadow = true;
                mesh.receiveShadow = true;
                this.linkGeometryGroup.add(mesh); // Add mesh to the dedicated group
            }

            // Update previous position for the next iteration
            prevFrameWorldPos.copy(currentFrameWorldPos);
        }

         // --- Optional: Connect last frame (O6) to the End Effector visual ---
         // 'prevFrameWorldPos' now holds the world position of Frame 6
         const lastFrame = this.frames[this.frames.length - 1]; // Frame 6
         const eeMesh = lastFrame.getObjectByName("EndEffectorVisual"); // Find the EE mesh added in setup
         if (eeMesh) {
             const eeWorldPos = eeMesh.getWorldPosition(worldPos.clone()); // Get EE visual's world pos
             const finalLinkVector = new THREE.Vector3().subVectors(eeWorldPos, prevFrameWorldPos);
             const finalLinkLength = finalLinkVector.length();

             if (finalLinkLength > 1e-4) {
                 const finalGeom = new THREE.CylinderGeometry(radius * 0.8, radius * 0.8, finalLinkLength, 16);
                 const finalQuat = new THREE.Quaternion();
                 const finalTargetDir = finalLinkVector.clone().normalize();
                  if (finalTargetDir.lengthSq() > 1e-6 && Math.abs(new THREE.Vector3(0, 1, 0).dot(finalTargetDir)) < 0.9999 ) {
                     finalQuat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), finalTargetDir);
                     finalGeom.applyQuaternion(finalQuat);
                 } else if (new THREE.Vector3(0, 1, 0).dot(finalTargetDir) <= -0.9999) {
                      finalGeom.rotateX(Math.PI);
                 }

                 const finalMesh = new THREE.Mesh(finalGeom, linkMaterial);
                 finalMesh.position.copy(prevFrameWorldPos).add(finalLinkVector.multiplyScalar(0.5));
                 finalMesh.castShadow = true;
                 finalMesh.receiveShadow = true;
                 this.linkGeometryGroup.add(finalMesh);
             }
         }
    }
    // --- Update Robot Pose ---
    updateRobotPose(jointAnglesRad) {
        if (jointAnglesRad.length !== this.dhParams.length) {
            console.error(`Expected ${this.dhParams.length} joint angles, but received ${jointAnglesRad.length}.`);
            return;
        }

        // Temporary matrix for calculations - declare it outside the loop
        const T = new THREE.Matrix4();

        // Iterate through each joint/link
        for (let i = 0; i < this.dhParams.length; i++) {
            const params = this.dhParams[i];
            // --- START: Restore DH Matrix Calculation ---
            const theta = jointAnglesRad[i] + params.theta_offset; // Actual joint angle + offset
            const alpha = params.alpha;
            const a = params.a;
            const d = params.d;

            const c_t = Math.cos(theta);
            const s_t = Math.sin(theta);
            const c_a = Math.cos(alpha);
            const s_a = Math.sin(alpha);

            // Construct the transformation matrix T_i^{i-1}
            // Using the formula provided for Classical DH
             T.set(
                 c_t, -s_t*c_a,  s_t*s_a, a*c_t,
                 s_t,  c_t*c_a, -c_t*s_a, a*s_t,
                   0,      s_a,      c_a,     d,
                   0,        0,        0,     1
             );
             // --- END: Restore DH Matrix Calculation ---

            // Apply this transformation to the corresponding frame's *local* matrix
            const frame = this.frames[i]; // frames[0] corresponds to T_1^0, etc.
            frame.matrix.copy(T); // Now 'T' is defined and holds the correct matrix for link i

            // Important: Decompose the matrix back into position, quaternion, scale
            // if you need to access these properties directly later.
            // frame.matrix.decompose(frame.position, frame.quaternion, frame.scale); // Uncomment if needed elsewhere
        }

        // Force update of world matrices for the entire hierarchy starting from the base
        this.robotBase.updateMatrixWorld(true);
        // console.log("Robot pose updated.");

        // --- Call function to update visual links ---
        this.updateLinkGeometry();
        // -----------------------------------------------
    }

    // --- Animation Loop ---
    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // Update controls if damping is enabled
        if (this.controls.enableDamping) {
            this.controls.update();
        }

        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }

    // --- Window Resize Handler ---
    onWindowResize() {
        if (!this.camera || !this.renderer) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }
}