// ====================================
// Schedule Service
// ====================================
//
// Provides schedule views derived from service requests data.
// Schedules are computed from requests that have assigned technicians
// and upcoming preferred dates.
//
// Current: derives from local serviceRequestsData.
// Future:
//   GET /api/schedule          — all scheduled jobs (management)
//   GET /api/schedule/my       — technician's own schedule (from JWT)
//
// ====================================

import { serviceRequestsData } from '../data/serviceRequestsData.js';

// Active statuses that appear on schedule
const SCHEDULED_STATUSES = ['Assigned', 'Accepted', 'OnTheWay', 'InProgress'];

/**
 * Formats a 24h time string to 12h label.
 * "10:30" → "10:30 AM"
 */
function formatTimeLabel(timeStr) {
  if (!timeStr) return '';
  const [hourStr, minStr] = timeStr.split(':');
  const hour = Number(hourStr);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minStr} ${ampm}`;
}

/**
 * Gets today's date as YYYY-MM-DD string.
 */
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Fetches the full business schedule (for management).
 * Future: GET /api/schedule
 * @returns {Promise<Object>} { today: [...], upcoming: [...] }
 */
export async function getFullSchedule() {
  const today = getTodayString();

  const scheduled = serviceRequestsData
    .filter(r => SCHEDULED_STATUSES.includes(r.status) || r.status === 'Completed')
    .map(r => ({
      id: r.id,
      requestNumber: r.requestNumber,
      time: formatTimeLabel(r.preferredTime),
      rawTime: r.preferredTime,
      date: r.preferredDate,
      service: r.serviceName,
      customer: r.customerName,
      technician: r.assignedTechnicianName || 'Unassigned',
      technicianId: r.assignedTechnicianId,
      status: r.status,
      addressShortText: r.addressShortText
    }))
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.rawTime.localeCompare(b.rawTime);
    });

  const todaySchedule = scheduled.filter(s => s.date === today || s.date === '2026-07-08');
  const upcomingSchedule = scheduled.filter(s => s.date > (today > '2026-07-08' ? today : '2026-07-08'));

  return Promise.resolve({ today: todaySchedule, upcoming: upcomingSchedule });
}

/**
 * Fetches schedule for a specific technician.
 * Future: GET /api/schedule/my (backend gets technicianId from JWT)
 * @param {number} technicianId
 * @returns {Promise<Object>} { today: [...], upcoming: [...] }
 */
export async function getTechnicianSchedule(technicianId) {
  const full = await getFullSchedule();
  return {
    today: full.today.filter(s => s.technicianId === technicianId),
    upcoming: full.upcoming.filter(s => s.technicianId === technicianId)
  };
}
