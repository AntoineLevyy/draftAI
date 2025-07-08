// Configuration for different environments
const config = {
  development: {
    apiBaseUrl: 'http://localhost:5001'
  },
  production: {
    apiBaseUrl: 'https://draft-ai-api.onrender.com' // This will be your deployed API URL
  }
};

// Get the current environment
const environment = import.meta.env.MODE || 'development';

// Export the appropriate config
export const apiBaseUrl = config[environment].apiBaseUrl; 