/**
 * Format a number as a Euro currency string.
 * @param {number} n - Amount in EUR
 * @returns {string} Formatted string e.g. '€1,234.56'
 */
export function formatEuro(n) {
  return '€' + Number(n).toLocaleString('en-MT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Format a number as a Euro currency string without decimals.
 * @param {number} n - Amount in EUR
 * @returns {string} Formatted string e.g. '€1,234'
 */
export function formatEuroShort(n) {
  return '€' + Number(n).toLocaleString('en-MT', { maximumFractionDigits: 0 });
}
