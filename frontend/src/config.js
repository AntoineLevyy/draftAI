// Configuration for different environments
const config = {
  development: {
    apiBaseUrl: 'https://draftai.onrender.com' // Use live API even in development
  },
  production: {
    apiBaseUrl: 'https://draftai.onrender.com' // Your actual deployed API URL
  }
};

// Get the current environment
const environment = import.meta.env.MODE || 'development';

// Export the appropriate config
export const apiBaseUrl = config[environment].apiBaseUrl; 