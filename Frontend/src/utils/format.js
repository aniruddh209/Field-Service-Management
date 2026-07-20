// ====================================
// Format Utilities
// ====================================
//
// Reusable helper functions to format data in the UI.
// Ensures consistent display format across all roles.
//
// ====================================

/**
 * Formats a numeric value to Indian Rupees format.
 * Example: 2450 -> "₹2,450"
 * @param {number} value - The numeric value to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value) {
  if (value === undefined || value === null || isNaN(value)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Formats standard internal status names into readable text.
 * Example: "InProgress" -> "In Progress"
 * @param {string} status - Internal status key (e.g., "InProgress", "UnderReview")
 * @returns {string} Human-readable status label
 */
export function formatStatus(status) {
  const mapping = {
    Pending: 'Pending',
    UnderReview: 'Under Review',
    Assigned: 'Assigned',
    Accepted: 'Accepted',
    OnTheWay: 'On The Way',
    InProgress: 'In Progress',
    WorkCompleted: 'Work Completed',
    Completed: 'Completed',
    Invoiced: 'Invoiced',
    PaymentDone: 'Payment Done',
    Closed: 'Closed',
    Cancelled: 'Cancelled',
    Paid: 'Paid',
    Overdue: 'Overdue'
  };
  return mapping[status] || status || '';
}

/**
 * Formats an ISO date string or date string to a readable format.
 * If the date is today or tomorrow, it returns "Today" or "Tomorrow".
 * @param {string} dateString - Date string (e.g. "2026-07-08" or "2026-07-08T10:30:00")
 * @returns {string} Formatted date label
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  
  // Parse date
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  // Helper to compare dates without time component
  const isSameDay = (d1, d2) => 
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(date, today)) {
    return 'Today';
  }
  
  if (isSameDay(date, tomorrow)) {
    return 'Tomorrow';
  }

  // General format
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
