// Configuration for different environments
const config = {
  development: {
    apiBaseUrl: 'http://localhost:5001' // Use local API for development
  },
  production: {
    apiBaseUrl: 'https://draftme.onrender.com' // Your actual deployed API URL
  }
};

// Get the current environment
const environment = import.meta.env.MODE || 'development';

// Export the appropriate config
export const apiBaseUrl = config[environment].apiBaseUrl; 