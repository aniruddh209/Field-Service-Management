// ====================================
// Technician Service
// ====================================
//
// CRUD operations on technicians.
//
// Current: modifies local dummy copy in memory (resets on reload).
// Future:
//   GET  /api/technicians
//   GET  /api/technicians/{id}
//   GET  /api/technicians/available
//   POST /api/technicians
//   PUT  /api/technicians/{id}
//
// ====================================

import { techniciansData } from '../data/techniciansData.js';
import { isTechnicianAssignable } from '../utils/technicianHelpers.js';

let technicians = [...techniciansData];

/**
 * Retrieves all technicians.
 * Future: GET /api/technicians
 */
export async function getTechnicians() {
  return Promise.resolve([...technicians]);
}

/**
 * Retrieves a single technician by ID.
 * Future: GET /api/technicians/{id}
 */
export async function getTechnicianById(id) {
  return Promise.resolve(technicians.find(t => t.id === Number(id)) || null);
}

/**
 * Retrieves a technician by their user account ID.
 * Used when a logged-in technician needs to find their technician profile.
 * Future: GET /api/technicians/me (backend resolves from JWT)
 */
export async function getTechnicianByUserId(userId) {
  return Promise.resolve(technicians.find(t => t.userId === Number(userId)) || null);
}

/**
 * Filters technicians with Available status.
 * Future: GET /api/technicians/available
 */
export async function getAvailableTechnicians() {
  return Promise.resolve(
    technicians.filter(isTechnicianAssignable)
  );
}

/**
 * Creates a new technician.
 * Future: POST /api/technicians
 */
export async function createTechnician(data) {
  const newTech = {
    ...data,
    id: Math.max(...technicians.map(t => t.id), 0) + 1,
    activeJobCount: 0,
    rating: 0,
    isActive: true
  };
  technicians.push(newTech);
  return Promise.resolve(newTech);
}

/**
 * Updates a technician.
 * Future: PUT /api/technicians/{id}
 */
export async function updateTechnician(id, data) {
  const idx = technicians.findIndex(t => t.id === Number(id));
  if (idx === -1) return Promise.resolve(null);
  technicians[idx] = { ...technicians[idx], ...data };
  return Promise.resolve(technicians[idx]);
}
