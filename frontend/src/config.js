// Configuration for different environments
const config = {
  development: {
    apiBaseUrl: 'https://draftme.onrender.com' // Use production API for college data
  },
  production: {
    apiBaseUrl: 'https://draftme.onrender.com' // Your actual deployed API URL
  }
};

// Get the current environment
const environment = import.meta.env.MODE || 'development';

// Export the appropriate config
export const apiBaseUrl = config[environment].apiBaseUrl; 