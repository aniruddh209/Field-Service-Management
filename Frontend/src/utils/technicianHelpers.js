/**
 * Technician Status and Workload Helpers
 * 
 * Works with the Technician model from the ASP.NET Core backend.
 * API fields: status, activeJobs, isActive
 */

/**
 * Calculates operational availability status dynamically.
 * 
 * Rules:
 * - If Account is Disabled (!isActive): Status is 'Inactive'
 * - If Status is 'On Leave': Status is 'On Leave'
 * - If has active assignments (activeJobs > 0): Status is 'Busy'
 * - Otherwise: Status is 'Available'
 * 
 * @param {Object} tech - Technician data object from API
 * @returns {string} Availability status label
 */
export function getTechnicianStatus(tech) {
  if (!tech) return 'Inactive';
  if (!tech.isActive) {
    return 'Inactive';
  }
  if (tech.status === 'On Leave' || tech.status === 'OnLeave') {
    return 'On Leave';
  }
  return tech.activeJobs > 0 ? 'Busy' : 'Available';
}

/**
 * Checks if a technician is ready/assignable for new jobs.
 * 
 * @param {Object} tech - Technician data object from API
 * @returns {boolean} True if assignable
 */
export function isTechnicianAssignable(tech) {
  if (!tech) return false;
  return (
    tech.isActive &&
    tech.status === 'Available'
  );
}

/**
 * Maps availability status to CSS badge classes.
 */
export const statusBadgeClasses = {
  Available: 'badge--completed',   // Green
  Busy: 'badge--in-progress',      // Blue/Purple
  'On Leave': 'badge--pending',    // Orange
  Inactive: 'badge--closed'        // Muted Grey
};