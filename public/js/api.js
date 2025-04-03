/**
 * API utility for handling both PyWebView and HTTP requests
 */

// Detect if running in PyWebView environment
const isPyWebView = () => {
    return window.pywebview !== undefined;
};

/**
 * Make an API call that works in both PyWebView and web browser environments
 * @param {string} endpoint - API endpoint (for HTTP) or method name (for PyWebView)
 * @param {object} data - JSON data to send
 * @returns {Promise} Promise that resolves with the API response
 */
export const callBackend = async (endpoint, data) => {
    try {
        // If in PyWebView, use direct API calls
        if (isPyWebView()) {
            // Extract method name from endpoint (e.g. "/api/angular2cartesian" -> "angular2cartesian")
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
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return await response.json();
        }
    } catch (error) {
        console.error(`API call error (${endpoint}):`, error);
        throw error;
    }
};

// Log the detected environment during initial load
console.log(`Running in ${isPyWebView() ? 'PyWebView' : 'Web Browser'} environment`); 