/**
 * Utility functions for number formatting and validation
 */

/**
 * Formats a number to a localized string with currency symbol
 * Returns a fallback value if the number is invalid
 * 
 * @param {number|string} value - Number to format
 * @param {string} fallback - Fallback value to return if number is invalid
 * @param {string} currency - Currency symbol to append
 * @returns {string} Formatted number string or fallback value
 */
export const formatCurrency = (value, fallback = '0', currency = 'zł') => {
  if (value === null || value === undefined) return `${fallback} ${currency}`;
  
  try {
    // Convert string to number if needed
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    // Check if number is valid
    if (isNaN(num)) {
      return `${fallback} ${currency}`;
    }
    
    return `${num.toLocaleString()} ${currency}`;
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${fallback} ${currency}`;
  }
};

/**
 * Formats a number to a localized string with specified decimal places
 * Returns a fallback value if the number is invalid
 * 
 * @param {number|string} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @param {string} fallback - Fallback value to return if number is invalid
 * @returns {string} Formatted number string or fallback value
 */
export const formatNumber = (value, decimals = 0, fallback = '0') => {
  if (value === null || value === undefined) return fallback;
  
  try {
    // Convert string to number if needed
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    // Check if number is valid
    if (isNaN(num)) {
      return fallback;
    }
    
    if (decimals > 0) {
      return num.toFixed(decimals);
    } else {
      return num.toLocaleString();
    }
  } catch (error) {
    console.error('Error formatting number:', error);
    return fallback;
  }
};

/**
 * Formats a percentage value
 * Returns a fallback value if the number is invalid
 * 
 * @param {number|string} value - Percentage value to format
 * @param {number} decimals - Number of decimal places
 * @param {string} fallback - Fallback value to return if number is invalid
 * @returns {string} Formatted percentage string or fallback value
 */
export const formatPercentage = (value, decimals = 2, fallback = '0') => {
  if (value === null || value === undefined) return `${fallback}%`;
  
  try {
    // Convert string to number if needed
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    // Check if number is valid
    if (isNaN(num)) {
      return `${fallback}%`;
    }
    
    return `${num.toFixed(decimals)}%`;
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return `${fallback}%`;
  }
};
