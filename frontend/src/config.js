// Configuration for different environments
const config = {
  development: {
    apiBaseUrl: 'http://localhost:5001' // Use local API for development
  },
  production: {
    apiBaseUrl: 'http://localhost:5001' // Temporarily use local API until production is fixed
  }
};

// Get the current environment
const environment = import.meta.env.MODE || 'development';

// Export the appropriate config
export const apiBaseUrl = config[environment].apiBaseUrl; 