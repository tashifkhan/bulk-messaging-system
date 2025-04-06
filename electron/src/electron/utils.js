/**
 * Utility functions for the Electron app
 */

/**
 * Check if the app is running in development mode
 * @returns {boolean} true if running in development mode
 */
export function isDev() {
  return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';
}