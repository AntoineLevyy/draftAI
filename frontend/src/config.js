// Smart API URL detection
const getApiBaseUrl = () => {
  // Check if we're running locally (localhost or 127.0.0.1)
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('localhost');
  
  // Check if we're in development mode
  const isDevelopment = import.meta.env.MODE === 'development';
  
  // If we're on localhost OR in development mode, use local API
  if (isLocalhost || isDevelopment) {
    console.log('Using local API (localhost:5001)');
    return 'http://localhost:5001';
  }
  
  // Otherwise, use production API
  console.log('Using production API (draftai.onrender.com)');
  return 'https://draftai.onrender.com';
};

// Export the dynamically determined API URL
export const apiBaseUrl = getApiBaseUrl(); 