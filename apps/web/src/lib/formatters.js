/**
 * Shared currency and number formatting utilities.
 * Uses a single cached Intl.NumberFormat instance for performance.
 */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats a number as Indian Rupee currency (₹).
 * @param {number} value
 * @returns {string} e.g. "₹1,25,000.00"
 */
export function formatINR(value) {
  return inrFormatter.format(value);
}

/**
 * Formats a number with Indian locale grouping (no currency symbol).
 * @param {number} value
 * @returns {string} e.g. "1,25,000.00"
 */
export function formatNumber(value) {
  return Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}
