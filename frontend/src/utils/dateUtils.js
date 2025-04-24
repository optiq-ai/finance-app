/**
 * Utility functions for date formatting and validation
 */

/**
 * Formats a date string or object to a localized date string
 * Returns a fallback value if the date is invalid
 * 
 * @param {string|Date} date - Date to format
 * @param {string} fallback - Fallback value to return if date is invalid
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string or fallback value
 */
export const formatDate = (date, fallback = '-', options = {}) => {
  if (!date) return fallback;
  
  try {
    // Handle string dates
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }
    
    // Default options for date formatting
    const defaultOptions = { 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric',
      ...options
    };
    
    return dateObj.toLocaleDateString(undefined, defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
};

/**
 * Formats a date string or object to a localized date and time string
 * Returns a fallback value if the date is invalid
 * 
 * @param {string|Date} date - Date to format
 * @param {string} fallback - Fallback value to return if date is invalid
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date and time string or fallback value
 */
export const formatDateTime = (date, fallback = '-', options = {}) => {
  if (!date) return fallback;
  
  try {
    // Handle string dates
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }
    
    // Default options for date and time formatting
    const defaultOptions = { 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      ...options
    };
    
    return dateObj.toLocaleString(undefined, defaultOptions);
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return fallback;
  }
};

/**
 * Checks if a date string or object is valid
 * 
 * @param {string|Date} date - Date to validate
 * @returns {boolean} True if date is valid, false otherwise
 */
export const isValidDate = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return !isNaN(dateObj.getTime());
  } catch (error) {
    return false;
  }
};
