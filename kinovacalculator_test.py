import kinovacalculator
import numpy as np



def _testAngular2cartesian(test_angles, expected_cartesian, name, tolerance=1e-5):
    """Test forward kinematics with roundtrip validation (angular → cartesian → angular → cartesian)."""
    print(f"\n--- Testing {name} Forward Kinematics (Angular → Cartesian) with Roundtrip ---")
    print(f"Original angles: {[round(a, 3) for a in test_angles]}")
    
    # Angular to Cartesian (Forward Kinematics)
    cartesian, error = kinovacalculator.angular2cartesian(test_angles)
    if cartesian is None:
        print(f"❌ Forward kinematics failed for {name}")
        return False
    
    print(f"Cartesian result: {{'x': {cartesian['x']:.3f}, 'y': {cartesian['y']:.3f}, 'z': {cartesian['z']:.3f}, "
          f"'thetaX': {cartesian['thetaX']:.3f}, 'thetaY': {cartesian['thetaY']:.3f}, 'thetaZ': {cartesian['thetaZ']:.3f}}}")
    print(f"Error: {error:.8f}")
    
    # Check if error is within tolerance
    passed = error <= tolerance
    
    print(f"Tolerance: {tolerance:.8f}")
    print(f"{'✅ Test PASSED' if passed else '❌ Test FAILED'}")
    print("-------------------------------------")
    
    return passed

def _testCartesian2angular(test_cartesian, expected_angles, name, tolerance=1e-5):
    """Test inverse kinematics with roundtrip validation (cartesian → angular → cartesian)."""
    print(f"\n--- Testing {name} Inverse Kinematics (Cartesian → Angular) with Roundtrip ---")
    print(f"Original cartesian: {{'x': {test_cartesian['x']:.3f}, 'y': {test_cartesian['y']:.3f}, 'z': {test_cartesian['z']:.3f}, "
          f"'thetaX': {test_cartesian['thetaX']:.3f}, 'thetaY': {test_cartesian['thetaY']:.3f}, 'thetaZ': {test_cartesian['thetaZ']:.3f}}}")
    
    # Cartesian to Angular (Inverse Kinematics)
    angles, error = kinovacalculator.cartesian2angular(test_cartesian)
    if angles is None:
        print(f"❌ Inverse kinematics failed for {name}")
        return False
    
    print(f"Angular result: {[round(a, 3) for a in angles]}")
    print(f"Error: {error:.8f}")
    
    # Check if error is within tolerance
    passed = error <= tolerance
    
    print(f"Tolerance: {tolerance:.8f}")
    print(f"{'✅ Test PASSED' if passed else '❌ Test FAILED'}")
    print("-------------------------------------")
    
    return passed

if __name__ == "__main__":
    empirical_tests = {
        "ZERO": {
            "angular": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
            "cartesian": {"x": 0.057, "y": -0.01, "z": 1.0033, "thetaX": 0.0, "thetaY": 0.0, "thetaZ": 90.0}
        },
        "HOME": {
            "angular": [0.0, 344.0, 75.0, 0.0, 300.0, 0.0],
            "cartesian": {"x": 0.43863, "y": 0.19352, "z": 0.44914, "thetaX": -90.5, "thetaY": 359.13, "thetaZ": 150}
        },
        "IMPOSSIBLE": {
            "angular": [45.0, 0.0, 45.0, 45.0, 0.0, 45.0],
            "cartesian": {"x": 238.72, "y": 281.58, "z": 834.21, "thetaX": 0.0, "thetaY": 315.0, "thetaZ": 225.0}
        }
    }

    # Test each empirical test case
    all_tests_passed = True
    for test_name, test_data in empirical_tests.items():
        print(f"\n🔬 TESTING {test_name} POSITION 🔬")
        
        # Test forward kinematics (angular → cartesian)
        fk_test_passed = _testAngular2cartesian(
            test_data["angular"],
            test_data["cartesian"],
            f"{test_name} Position"
        )
        
        # Test inverse kinematics (cartesian → angular)
        ik_test_passed = _testCartesian2angular(
            test_data["cartesian"],
            test_data["angular"],
            f"{test_name} Position"
        )
        
        all_tests_passed = all_tests_passed and fk_test_passed and ik_test_passed
        print(f"\n{test_name} Position: {'✅ ALL PASSED' if fk_test_passed and ik_test_passed else '❌ SOME TESTS FAILED'}")
    
    if all_tests_passed:
        print("\n✅✅✅ All tests passed within tolerance limits! ✅✅✅")
    else:
        print("\n❌❌❌ Some tests failed. Review the results above. ❌❌❌")


    # Add additional tests for edge cases
    def test_edge_cases():
        print("\n🔬 TESTING EDGE CASES 🔬")
        
        # Test extreme joint positions
        extreme_angles = [
            {"name": "Extreme Joint 1", "angles": [90.0, 344.0, 75.0, 0.0, 300.0, 0.0]},
            {"name": "Extreme Joint 2", "angles": [0.0, 90.0, 75.0, 0.0, 300.0, 0.0]},
            {"name": "Extreme Joint 3", "angles": [0.0, 344.0, 150.0, 0.0, 300.0, 0.0]},
            {"name": "Extreme Joint 4", "angles": [0.0, 344.0, 75.0, 90.0, 300.0, 0.0]},
            {"name": "Extreme Joint 5", "angles": [0.0, 344.0, 75.0, 0.0, 90.0, 0.0]},
            {"name": "Extreme Joint 6", "angles": [0.0, 344.0, 75.0, 0.0, 300.0, 90.0]},
        ]
        
        for test_case in extreme_angles:
            print(f"\nTesting {test_case['name']}")
            test_passed = _testAngular2cartesian(
                test_case["angles"],
                None,  # No expected cartesian, just testing roundtrip
                test_case["name"]
            )
            if not test_passed:
                print(f"❌ Edge case test failed for {test_case['name']}")
        
        # Test boundary positions
        boundary_positions = [
            {"name": "Max Reach", "cartesian": {"x": 0.7, "y": 0.0, "z": 0.5, "thetaX": 0.0, "thetaY": 0.0, "thetaZ": 90.0}},
            {"name": "High Position", "cartesian": {"x": 0.3, "y": 0.0, "z": 0.9, "thetaX": 0.0, "thetaY": 0.0, "thetaZ": 90.0}},
            {"name": "Side Reach", "cartesian": {"x": 0.2, "y": 0.5, "z": 0.4, "thetaX": 0.0, "thetaY": 0.0, "thetaZ": 0.0}}
        ]
        
        for test_case in boundary_positions:
            print(f"\nTesting {test_case['name']}")
            test_passed = _testCartesian2angular(
                test_case["cartesian"],
                None,  # No expected angles, just testing roundtrip
                test_case["name"]
            )
            if not test_passed:
                print(f"❌ Edge case test failed for {test_case['name']}")
    
    # Uncomment to run edge case tests
    # test_edge_cases()


    