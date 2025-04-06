/**
 * Handles the loading spinner functionality
 */

// Function to hide the loader when the app is initialized
export function hideLoader() {
    const loader = document.getElementById('loader-overlay');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
}

// Function to show the loader (if needed)
export function showLoader() {
    const loader = document.getElementById('loader-overlay');
    if (loader) {
        loader.style.opacity = '1';
        loader.style.display = 'flex';
    }
} 