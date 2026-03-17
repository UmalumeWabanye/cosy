/**
 * Format a price in ZAR
 * @param {number} amount
 * @returns {string}
 */
export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

/**
 * Truncate a string to maxLength characters
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (str, maxLength = 80) =>
  str && str.length > maxLength ? `${str.slice(0, maxLength)}…` : str;
