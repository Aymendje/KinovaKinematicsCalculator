from flask import Flask, request, jsonify, send_from_directory
import kinovacalculator_api


app = Flask(__name__, static_folder='public')



@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    # Set proper MIME type for JavaScript files
    if path.endswith('.js'):
        return send_from_directory(app.static_folder, path, mimetype='application/javascript')
    elif path.endswith('.css'):
        return send_from_directory(app.static_folder, path, mimetype='text/css')
    return send_from_directory(app.static_folder, path)

@app.route('/api/cartesian2angular', methods=['POST'])
def cartesian2angular():
    result = kinovacalculator_api.cartesian2angular_api(request.get_json())
    if result is None or result[0] is None:
        return jsonify({
            'success': False,
            'error': 'Failed to solve inverse kinematics'
        }), 400
        
    joint_angles, error_metric = result
    
    return jsonify({
        'success': True,
        'q': joint_angles,
        'error': round(error_metric, 2)
    })

@app.route('/api/angular2cartesian', methods=['POST'])
def angular2cartesian():
    
    result = kinovacalculator_api.angular2cartesian_api(request.get_json())
        
    if result[0] is None:
            return jsonify({
                'success': False,
                'error': 'Failed to calculate forward kinematics'
            }), 400
            
    cartesian_pose, error_metric = result
    
    return jsonify({
        'success': True,
        'pose': cartesian_pose,
        'error': round(error_metric, 2)
    })
    

if __name__ == '__main__':
    app.run(debug=True, port=5000) 