// Configuration for different environments
const config = {
  development: {
    apiBaseUrl: 'http://127.0.0.1:5001' // Use local API in development
  },
  production: {
    apiBaseUrl: 'https://draftme.onrender.com' // Your actual deployed API URL
  }
};

// Get the current environment
const environment = import.meta.env.MODE || 'development';

// Export the appropriate config
export const apiBaseUrl = config[environment].apiBaseUrl; 