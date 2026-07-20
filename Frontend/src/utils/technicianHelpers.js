/**
 * Technician Status and Workload Helpers
 */

/**
 * Calculates operational availability status dynamically.
 * 
 * Rules:
 * - If Account is Disabled (!isActive) or Employment Status is Inactive: Status is 'Inactive'
 * - If Employment Status is On Leave: Status is 'On Leave'
 * - If Employment Status is Active and has active assignments: Status is 'Busy'
 * - Otherwise: Status is 'Available'
 * 
 * @param {Object} tech - Technician data object
 * @returns {string} Availability status label
 */
export function getTechnicianStatus(tech) {
  if (!tech) return 'Inactive';
  if (!tech.isActive || tech.employmentStatus === 'Inactive') {
    return 'Inactive';
  }
  if (tech.employmentStatus === 'On Leave' || tech.employmentStatus === 'OnLeave') {
    return 'On Leave';
  }
  return tech.activeJobCount > 0 ? 'Busy' : 'Available';
}

/**
 * Checks if a technician is ready/assignable for new jobs.
 * 
 * @param {Object} tech - Technician data object
 * @returns {boolean} True if assignable
 */
export function isTechnicianAssignable(tech) {
  if (!tech) return false;
  return (
    tech.isActive &&
    tech.employmentStatus === 'Active'
  );
}

/**
 * Maps availability status to CSS badge classes.
 */
export const statusBadgeClasses = {
  Available: 'badge--completed', // Green
  Busy: 'badge--in-progress',     // Blue/Purple
  'On Leave': 'badge--pending',  // Orange
  Inactive: 'badge--closed'      // Muted Grey
};
